---
title: "Fabric Medallion Pipeline — Microsoft Build 2026"
description: "This Microsoft Build 2026 refresh explains the SPA as a production-style Microsoft Fabric medallion architecture: raw events or files enter Bronze, PySpark notebooks cleanse and conform them in Silver, and Gold Delta…"
space: "Cloud & operations"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/fabric-pipeline.html"
demo: "/fabric.html"
---

> This Microsoft Build 2026 refresh explains the SPA as a production-style Microsoft Fabric medallion architecture: raw events or files enter Bronze, PySpark notebooks cleanse and conform them in Silver, and Gold Delta tables feed Direct Lake semantic models for Power BI. The demo animation uses Event Hub, Eventstream, Bronze, Silver, Gold, and Semantic Model stages; the article grounds those visuals in real operating patterns for OneLake, Fabric Data Pipelines, Spark notebooks, and zero-copy shortcuts.



- **3** — Medallion Layers

- **24** — Bronze Raw Tables

- **5** — Silver Clean Tables

- **7** — Gold BI Tables



Source Event→ Bronze Landing→ Silver Quality→ Gold Model→ Power BI



## 1. The Medallion Architecture



The SPA shows a compact pipeline, but the pattern scales to a full data platform. Bronze, Silver, and Gold are separate Lakehouses so each layer has a clear contract. Bronze preserves the source record, Silver applies business rules and data quality gates, and Gold publishes curated facts, aggregates, and marts for analytics.



Fabric changes the center of gravity from database servers to OneLake. Instead of linked servers and stored procedures reaching across multiple machines, notebooks read committed Delta tables from the prior layer and write the next layer. The pipeline controls dependency order, but notebooks do not share memory; they communicate through persisted Delta tables.



| Layer | Lakehouse Pattern | Table Pattern | Responsibility |
| --- | --- | --- | --- |
| Bronze | `lh_*_brz` | `azsql_*_raw` or `{source}_*_raw` | Exact source copy, append-only landing, audit trail, schema-on-read tolerance |
| Silver | `lh_*_slv` | `{domain}_*_clean` | Typed columns, deduplication, PII handling, conformed business rules |
| Gold | `lh_*_gld` | `fct_*`, `agg_*`, `mart_*` | Business-ready facts, aggregations, dimensional marts, semantic model inputs |



> **Why this replaces the legacy SQL Server pattern:** the old model centralizes transformation inside synchronous stored procedures, SQL Agent schedules, and cross-server dependencies. Fabric makes the work cloud-native: data lands once in OneLake, Spark transforms it in parallel, pipelines orchestrate dependencies, Git captures changes, and Power BI reads curated Delta tables without copying them into another serving store.



### Reference workspace inventory



The numbers below are sanitized from a production migration pilot and show how the SPA's six-stage animation maps to real Fabric artifacts.



| Artifact | Example Name | Purpose |
| --- | --- | --- |
| Bronze Lakehouse | `lh_loanetl_brz` | Raw source extracts and file/event landings |
| Silver Lakehouse | `lh_loanetl_slv` | Cleansed tables with stored-procedure logic translated to PySpark |
| Gold Lakehouse | `lh_loanetl_gld` | Fact, aggregate, and mart tables consumed by analytics |
| Ingestion Notebook | `nb_ing_loanetl_brz` | Source-to-Bronze extraction or mock/demo data generation |
| Transform Notebook | `nb_tfm_loanetl_brz_slv` | Bronze-to-Silver cleansing, joins, and quality rules |
| Aggregation Notebook | `nb_tfm_loanetl_slv_gld` | Silver-to-Gold facts, aggregates, and marts |
| Pipeline | `pl_orch_loanetl` | Sequential DAG across ingestion, transformation, publication, and maintenance |



## 2. Bronze: Raw Ingestion



Bronze is deliberately boring. It lands source data with minimal interpretation, adds audit columns, and keeps enough fidelity to replay or reprocess when downstream rules change. In a legacy migration, Bronze might start as JDBC extracts from a legacy SQL Server. In an event-driven design, Bronze receives file metadata or streaming events from Event Hub and Eventstream.



The important production lesson is that the ingestion trigger can evolve without rewriting the processing logic. A scheduled SFTP poll can become a storage event that flows through Event Hub, Fabric Eventstream, and Eventhouse. The downstream Data Pipeline still starts the same notebook chain; only the readiness signal changes from “the clock fired” to “the file or event arrived.”



| Pattern | Legacy Behavior | Fabric Evolution |
| --- | --- | --- |
| SFTP polling | Pipeline checks a vendor location on a fixed schedule | ADLS Gen2 SFTP endpoint emits a `BlobCreated` event after landing |
| Late files | Missed until the next polling window | Handled as soon as the event arrives |
| Large transfers | Risk of reading partial or duplicated files | One event per committed file path with size and timestamp metadata |
| Audit trail | Pipeline run history only | Queryable KQL/Eventhouse table with every file-arrival event |



```text
# Bronze write pattern — raw landing with audit columns
from pyspark.sql.functions import current_timestamp, lit

source_table = "master_skip_trace"
bronze_table = f"azsql_{source_table}_raw"

df_bronze = (
    df_source
    .withColumn("_brz_load_ts", current_timestamp())
    .withColumn("_brz_source_table", lit(f"legacy_sql_server.dbo.{source_table}"))
)

(
    df_bronze.write
    .format("delta")
    .mode("append")
    .option("mergeSchema", "true")
    .saveAsTable(bronze_table)
)
```



Schema-on-read is a strength at this layer. Bronze can absorb new source columns, retain raw payloads, and defer interpretation until Silver. That keeps ingestion resilient while preserving a complete audit trail for reconciliation.



## 3. Silver: Conformed & Cleansed



Silver is where the data platform earns trust. PySpark notebooks replace stored procedure logic with version-controlled code that can be tested locally, reviewed in Git, and promoted through environments. Typical Silver work includes casting strings to dates and decimals, deduplicating by business keys, applying joins that previously crossed SQL Server instances, hashing PII, and quarantining invalid records instead of silently publishing them.



Data quality gates belong here because Silver is the contract for downstream consumers. If a required key is missing, a status code is unknown, or a record violates a business invariant, the notebook should fail visibly or route the row to a quarantine table. Gold should never need to guess whether its inputs are trustworthy.



```text
# Bronze to Silver — conformed, typed, and quality checked
from pyspark.sql.functions import col, current_timestamp, sha2, concat_ws, lit, to_date

bronze = spark.table("lh_loanetl_brz.dbo.azsql_master_skip_trace_raw")

silver = (
    bronze
    .filter(col("LoanID").isNotNull())
    .dropDuplicates(["LoanID", "Record_Date"])
    .withColumn("Record_Date", to_date(col("Record_Date")))
    .withColumn("Phone_Hash", sha2(concat_ws("|", col("Phone"), lit("platform_salt")), 512))
    .drop("Phone")
    .withColumn("_slv_processed_ts", current_timestamp())
)

invalid_count = silver.filter(col("Record_Date").isNull()).count()
if invalid_count:
    raise ValueError(f"Data quality gate failed: {invalid_count} missing Record_Date values")

(
    silver.write
    .format("delta")
    .mode("overwrite")
    .option("replaceWhere", "Record_Date = '2026-05-09'")
    .saveAsTable("loanetl_batch_skip_trace_clean")
)
```



### Silver migration patterns



| SQL Server Pattern | Fabric Silver Pattern | Why It Works |
| --- | --- | --- |
| Stored procedure with temp tables | PySpark DataFrames and temp views | Spark optimizes the execution plan before running distributed work |
| Linked-server joins | Lakehouse table reads from OneLake | No WAN hop and no circular server dependency |
| T-SQL encryption functions | `sha2(..., 512)` or Key Vault-backed handling | PII rules are explicit and reviewable in code |
| `UNION ALL` by ordinal | `unionByName(allowMissingColumns=True)` | Prevents schema drift from misaligning columns |
| SCD Type 2 merge logic | Delta merge or anti-join + union pattern | Retains history with effective dates and current-row flags |



## 4. Gold: Dimensional Models



Gold is intentionally smaller than Silver. It is shaped for analytics: facts at a clear grain, aggregates that avoid repeated expensive scans, and marts that align to business questions. The SPA's “Gold” and “Semantic Model” stages reflect this split: Spark publishes Delta tables, then Power BI semantic models define relationships, DAX measures, and presentation logic.



Direct Lake matters because Power BI can read Delta tables in OneLake without scheduled import copies. The result is a cleaner serving path: Gold tables stay in the Lakehouse, semantic definitions sit on top of them, and reports query governed data rather than disconnected extracts.



```text
# Silver to Gold — dimensional facts and aggregates
from pyspark.sql.functions import count, sum as spark_sum, current_timestamp

silver = spark.table("lh_loanetl_slv.dbo.loanetl_batch_skip_trace_clean")

fct_batch_skip_trace = (
    silver
    .select("LoanID", "Record_Date", "Disposition", "Phone_Hash")
    .withColumn("_gld_published_ts", current_timestamp())
)

agg_daily_disposition = (
    silver
    .groupBy("Record_Date", "Disposition")
    .agg(
        count("LoanID").alias("Loan_Count"),
        spark_sum("Attempt_Count").alias("Attempt_Count")
    )
    .withColumn("_gld_published_ts", current_timestamp())
)

fct_batch_skip_trace.write.format("delta").mode("overwrite").saveAsTable("fct_batch_skip_trace")
agg_daily_disposition.write.format("delta").mode("overwrite").saveAsTable("agg_skip_trace_daily")
```



| Gold Prefix | Use | Example |
| --- | --- | --- |
| `fct_` | Event or transaction grain facts | `fct_batch_skip_trace` |
| `agg_` | Pre-computed rollups for BI performance | `agg_loan_accretion_summary` |
| `mart_` | Wide, consumer-friendly views of a business domain | `mart_customer_360` |



## 5. Pipeline Orchestration



Fabric Data Pipelines replace the SQL Agent and SSIS pattern with an explicit dependency DAG. The pipeline can run notebooks sequentially, retry transient failures, pass parameters such as `etl_process_date`, and keep each activity observable. In the pilot pattern, Bronze must succeed before Silver starts, Silver must succeed before Gold starts, and maintenance can run after publication or on a separate schedule.



This is not the same mental model as a single stored procedure transaction. Fabric is choreographed, eventual, and asynchronous. Each notebook commits Delta tables; the next notebook reads those committed tables. That boundary makes reruns safer, troubleshooting clearer, and environment promotion easier.



| Order | Pipeline Activity | Notebook | Dependency |
| --- | --- | --- | --- |
| 1 | Bronze Ingestion | `nb_ing_loanetl_brz` | Triggered by schedule, event, or manual run |
| 2 | Bronze to Silver | `nb_tfm_loanetl_brz_slv` | Runs only after Bronze succeeds |
| 3 | Silver to Gold | `nb_tfm_loanetl_slv_gld` | Runs only after Silver succeeds |
| 4 | Table Maintenance | `nb_mnt_loanetl_maintenance` | Optimizes Delta tables after publication |



## 6. OneLake Shortcuts



OneLake Shortcuts are the Fabric replacement for many linked-server and copy-heavy integration patterns. A table can physically live in one Lakehouse while another Lakehouse, Warehouse, or consuming workspace references it through a shortcut. The consumer sees a table-like object; the platform avoids duplicating the underlying Delta files.



This matters when Bronze data lands in Lakehouse A but multiple domains need to transform or enrich it in Lakehouse B. Instead of copying raw data into every workspace, the data platform can expose governed shortcuts. Teams get local-looking access while storage remains centralized and auditable.



| Old Pattern | Shortcut Pattern | Benefit |
| --- | --- | --- |
| Linked server to another SQL instance | Shortcut to another Lakehouse table | No server-to-server dependency or hybrid network hop |
| Nightly copy between marts | Zero-copy reference to Gold Delta table | Lower latency, lower storage cost, fewer reconciliation jobs |
| Warehouse owns duplicated reporting tables | Warehouse shortcut to Gold Lakehouse | T-SQL consumption without moving data out of OneLake |



```text
# Conceptual read through a shortcut-backed table
# Bronze physically lands in lh_source_brz.
# lh_reporting_brz exposes it as a OneLake Shortcut, so the transform reads locally.

raw_events = spark.table("lh_reporting_brz.dbo.azsql_transaction_events_raw")

silver_events = (
    raw_events
    .filter("event_type is not null")
    .dropDuplicates(["event_id"])
)

silver_events.write.format("delta").mode("overwrite").saveAsTable("platform_transaction_events_clean")
```



That is the key Build 2026 story: Fabric is not just a new place to run old database jobs. It is a governed data operating model where OneLake is the storage substrate, Spark handles transformation, Data Pipelines choreograph work, and Direct Lake semantic models serve analytics from the same Delta files.
