---
title: "Fabric Capacity Tuner — Size F-SKUs, Tame 430s"
description: "Microsoft Fabric capacity sizing is a balancing act between cost, concurrency, and throttling risk. The Fabric Capacity Tuner demo turns that tradeoff into a live model: choose an F-SKU, select the mix of…"
space: "Cloud & operations"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/fabric-capacity-tuner.html"
demo: "/fabriccap.html"
---

> Microsoft Fabric capacity sizing is a balancing act between cost, concurrency, and throttling risk. The Fabric Capacity Tuner demo turns that tradeoff into a live model: choose an F-SKU, select the mix of DirectQuery, Import Refresh, Spark Notebook, Pipeline Activity, Dataflow Gen2, and KQL Query workloads, then raise concurrency until utilization moves from healthy to 430-throttled. The operating lesson is simple: size for sustained load, schedule bursty background jobs, and fix CU-heavy Spark patterns before buying a larger SKU.



- **8** — F-SKUs

- **6** — Workload Types

- **5** — Mitigations

- **430** — Throttled



Observe→ Decompose→ Schedule→ Mitigate→ Right-Size



## F-SKU Sizing 101



Fabric F-SKUs are purchased capacity for a tenant or workspace estate. Each SKU gives a fixed number of Capacity Units (CU). Workspaces assigned to the capacity share that CU pool across Power BI, Data Factory, Data Engineering, Data Science, Real-Time Intelligence, Warehouse, and Lakehouse activity.



The simulator uses the same mental model an operator uses during an incident: compare concurrent CU demand against available SKU CU. Green means there is headroom, amber means monitor, orange means smoothing is absorbing pressure, and red means sustained demand exceeds the capacity envelope.



| SKU | Capacity Units | Approx. list price / month | Typical role |
| --- | --- | --- | --- |
| F2 | 2 CU | $262.80 | Small development, proof-of-concept, light reports |
| F4 | 4 CU | $525.60 | Team sandbox with low concurrency |
| F8 | 8 CU | $1,051.20 | Shared dev/test, light pipelines, simple semantic models |
| F16 | 16 CU | $2,102.40 | Entry production with disciplined scheduling |
| F32 | 32 CU | $4,204.80 | Medium production, multiple domains, mixed BI and ETL |
| F64 | 64 CU | $8,409.60 | Large production, full smoothing, high BI concurrency |
| F128 | 128 CU | $16,819.20 | Enterprise shared capacity with heavy Spark and Warehouse |
| F256 | 256 CU | $33,638.40 | Very large tenant-wide platforms or isolated critical estates |



> **Smoothing matters:** Fabric evaluates throttling through smoothed usage, not just a single instant. Background work can be smoothed across a 24-hour rolling window on larger capacities, which is why a short spike does not always produce an immediate 430. Sustained overage is different: once the smoothing buffer is exhausted, new or continuing work can be delayed, rejected, or throttled.



That is why the demo's thresholds are deliberately conservative. Under 50% utilization, there is room for mistakes. From 50% to 80%, teams should watch trends. From 80% to 100%, every new schedule or notebook matters. Above 100%, the operator should expect the capacity to spend down smoothing credits and eventually throttle.



The right response is not always an immediate scale-up. First, determine whether the pressure is interactive, background, or accidental. A user-facing DirectQuery peak deserves a different response than a forgotten notebook pool, an import refresh storm, or a dataflow that is scanning unchanged rows.



- **Interactive pressure** needs immediate user-impact mitigation.

- **Background pressure** usually needs scheduling and smoothing.

- **Accidental pressure** needs guardrails, not a bigger invoice.




## Capacity Units (CU): The Currency of Fabric



Capacity Units are the budget Fabric spends to execute work. A Spark session consumes CU based on driver and executor cores. A report query consumes CU while the visual renders. A pipeline consumes CU while activities orchestrate movement and transformation. The shared capacity is healthy when the total smoothed demand stays below the SKU's available CU.



For Spark notebooks, a practical rule from production operations is that one vCore is approximately one CU. An oversized environment with 8 driver cores and 8 executor cores can consume an entire F16. If dynamic allocation is disabled, that session can hold the capacity even while a user is between notebook cells.



The most useful dashboard question is not “what is the average usage?” It is “which workspace, item, or workload is holding CU during the peak?” The Microsoft Fabric Capacity Metrics app is the first stop for that answer because it breaks down utilization by item and operation.



## Workload Profiles and Their CU Cost



The demo models six workload types. The CU values are intentionally simplified so the simulator is teachable: each selected workload contributes to per-user CU demand, and concurrency multiplies it. In real operations, the exact number depends on query shape, model design, Spark configuration, data size, cache state, and whether the work is interactive or background.



| Workload | Mode | Simulator CU | What drives cost | First optimization |
| --- | --- | --- | --- | --- |
| DirectQuery | Interactive | 2 CU | Visual count, query complexity, source latency | Reduce visuals, aggregate tables, migrate to DirectLake where possible |
| Import Refresh | Background | 4 CU | Dataset size, refresh frequency, transformation shape | Incremental refresh and overnight scheduling |
| Spark Notebook | Interactive or batch | 8 CU | Driver/executor cores, shuffle volume, joins, file pruning | Right-size environment and enable dynamic allocation |
| Pipeline Activity | Background | 2 CU | Copy volume, orchestration fan-out, retry behavior | Stagger schedules and avoid unnecessary polling loops |
| Dataflow Gen2 | Background | 6 CU | Power Query steps, joins, refresh window | Push filters earlier and materialize reusable tables |
| KQL Query | Interactive | 3 CU | Time range, cardinality, joins, result size | Constrain time windows and pre-aggregate high-volume streams |



## When Fabric Returns HTTP 430



HTTP 430 is the capacity signal. It is different from a generic API rate limit. In Fabric, a 430 means the capacity's smoothed usage has exceeded the allowed envelope and the service is protecting the capacity from more work. Operators often see this as failed notebook sessions, queued pipeline runs, delayed report renders, or API calls rejected during a peak.



Interactive throttling hurts users immediately because the person waiting for a visual, notebook cell, or SQL query is on the critical path. Background throttling is often less visible at first because scheduled jobs can be delayed, smoothed, or retried, but it still creates downstream freshness risk.



| Status | Fabric-specific interpretation | What to do |
| --- | --- | --- |
| 200 | Request completed successfully. | No incident. Record latency and CU if optimizing. |
| 202 | Request accepted; Fabric is running it asynchronously. | Poll the operation status with backoff instead of tight loops. |
| 429 | API rate limit or too many requests at the service boundary. | Back off, add jitter, reduce request fan-out, check caller behavior. |
| 430 | Capacity throttled because smoothed CU usage exceeded allowance. | Check Capacity Metrics, stop runaway work, reschedule jobs, or scale up. |
| 503 | Capacity or service unavailable, paused, deleted, or temporarily unhealthy. | Verify capacity state, region health, and workspace assignment. |



## The Mitigation Playbook



A 430 is rarely solved by one change. The durable fix is a playbook: identify the consuming workload, reduce waste, move flexible work away from peaks, isolate blast radius, and then right-size the SKU with evidence.



### 1. Overnight scheduling



**Use when:** import refreshes, Dataflow Gen2 runs, Spark training, table maintenance, or pipeline batches are not user-facing. Move them into off-hours windows so background smoothing can spread load across the day instead of colliding with interactive BI hours.



### 2. Workspace splits



**Use when:** one domain or experimental team can starve everyone else. Assign high-risk workspaces to separate capacities, or at least separate production, non-production, and sandbox work. This turns a tenant-wide incident into a team-scoped one.



### 3. DirectLake migration



**Use when:** import refresh is burning CU just to copy data that already lives in OneLake. DirectLake can reduce refresh pressure by reading Delta files directly while preserving interactive report performance for suitable semantic models.



### 4. Pause non-prod outside business hours



**Use when:** dev, test, and sandbox capacities are idle overnight or on weekends. F-SKUs bill while running, so pause/resume automation can remove a large share of non-prod monthly spend without changing production posture.



### 5. Right-size workloads before right-sizing SKUs



**Use when:** Capacity Metrics shows a small number of items causing peaks. Fix oversized Spark environments, inefficient joins, unbounded queries, excessive refresh frequency, and polling loops before moving from F32 to F64.



## PySpark Patterns That Save CU



PySpark is the place where small code choices can become large capacity events. The highest-return patterns are broadcast joins for small dimensions, predicate pushdown, partition pruning, compact file layouts, and Z-ordering columns used in filters and joins. These patterns reduce shuffle, scan fewer files, and shorten the time each session holds CU.



Notebook authors should also right-size Spark settings. Use dynamic allocation for interactive work, avoid fixed executor counts unless a job truly needs them, and reduce `spark.sql.shuffle.partitions` from the default when working on small or medium datasets.



```text
from pyspark.sql.functions import broadcast, col

spark.conf.set("spark.sql.shuffle.partitions", "8")
spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
spark.conf.set("spark.databricks.delta.autoCompact.enabled", "true")

orders = (
    spark.table("lh_sales_slv.sales_orders_clean")
         .where((col("OrderDate") >= "2026-01-01") & (col("OrderDate") < "2026-02-01"))
         .select("OrderId", "CustomerId", "OrderDate", "NetAmount")
)

customers = (
    spark.table("lh_sales_slv.dim_customer")
         .select("CustomerId", "Segment", "Region")
)

result = (
    orders
      .join(broadcast(customers), "CustomerId", "left")
      .repartition("OrderDate")
)

(result.write
    .format("delta")
    .mode("overwrite")
    .option("replaceWhere", "OrderDate >= '2026-01-01' AND OrderDate < '2026-02-01'")
    .saveAsTable("lh_sales_gld.fct_orders_month"))
```



The snippet keeps CU low by filtering early, selecting only needed columns, broadcasting a small dimension, partitioning the write by the date used for reruns, and avoiding a full-table overwrite. For large tables, pair this with Delta optimization and Z-ordering on high-selectivity columns used by report and warehouse queries.



## Right-Sizing: F32 vs F64 vs Pause Strategy



Right-sizing starts with observed utilization, not fear. If an F32 is below 40% most of the week and only spikes during a nightly batch, the answer is probably scheduling or query tuning, not F64. If it spends business hours above 80% with interactive users waiting, F64 may be justified. If non-prod sits idle for 14 hours a day, pause strategy may save more than a downsize.



| Choice | Best fit | Monthly implication | Risk |
| --- | --- | --- | --- |
| Stay on F32 | Peaks are rare, background, and controllable with schedule changes | About $4.2K/month | Requires discipline; runaway notebooks can still cause 430s |
| Move to F64 | Interactive demand regularly exceeds F32 even after optimization | About $8.4K/month | Can hide inefficient workloads instead of fixing them |
| Pause non-prod | Dev/test/sandbox capacity is idle outside business hours | Often 60–70% savings on those capacities | Needs reliable automation and clear developer expectations |



The practical operating loop is: observe seven days of Capacity Metrics, decompose by workspace and item, schedule flexible jobs away from the peak, mitigate inefficient patterns, and only then buy more CU. That loop keeps the platform reliable without turning every 430 into a procurement event.
