---
title: "Real-Time Log Pipeline — Event Hub to Eventhouse KQL"
description: "Microsoft Build 2026 portfolio deep dive for a real-time security and application log pipeline. The SPA shows the operational path: emit structured events, buffer them through Azure Event Hubs, route them with…"
space: "Cloud & operations"
date: "2026-11-04"
draft: false
legacyArticle: "/articles/log-pipeline.html"
demo: "/logs.html"
---

> Microsoft Build 2026 portfolio deep dive for a real-time security and application log pipeline. The SPA shows the operational path: emit structured events, buffer them through Azure Event Hubs, route them with Microsoft Fabric Eventstream, land them in Eventhouse, query them with KQL, and fan out alerts through Durable Functions. The implementation favors event-driven ingestion over polling so producers stay decoupled, queries stay hot, and alert workflows remain durable under bursty traffic.



- **< 1s** — Sub-Second Latency

- **KQL** — Native Query Layer

- **3** — Hot / Warm / Cold Tiers

- **Fan-Out** — Durable Alerting



Emit→ Event Hub→ Eventstream→ Eventhouse→ KQL→ Alert



## 1. Why Event-Driven



Polling works until the first real incident. A pull-based job asks every source, on a schedule, whether anything interesting happened. That creates idle reads during quiet periods and delayed visibility during spikes. The better pattern is to make every producer publish a durable event as soon as the fact exists.



In this design, services emit JSON to an Azure Event Hub namespace such as `evhns-secops-prd-...`. Event Hub provides the shock absorber: partitioned throughput, consumer groups, retention, replay, and a simple contract that producers can target without knowing where analytics data lands.



The SPA mirrors that model. Its ClojureScript demo renders a live stream, stage cards, and a KQL panel for the path from Clojure Functions to Event Hub, Eventstream, Eventhouse, parsed KQL tables, and Gold Lakehouse outputs.



> **Cost note:** At scale, this is cheaper than pushing every operational event into Log Analytics. Eventhouse is optimized for high-volume time-series queries, raw data can age into OneLake-backed storage, and only security-relevant incidents need SIEM-grade retention or Sentinel correlation.



## 2. The Kappa Architecture



Kappa architecture uses one pipeline for both stream and batch-style outcomes. Instead of copying the same log through Bronze, Silver, and Gold Lakehouses with notebooks at each hop, raw events land once in Eventhouse and KQL derives the shaped views, functions, update policies, and materialized views above it.



That makes the operational boundary cleaner. Platform engineering owns the plumbing: Event Hub, Eventstream, Eventhouse, identity, and retention. Application and security teams own their KQL: parsing rules, alert logic, dashboard views, and department-specific aggregations.



The practical advantage is accountability. If a service adds a field, the producer contract and KQL parser change together. There is no chained notebook dependency that has to be rescheduled before the dashboard becomes useful again.



### Common Alert Query



```text
let window = 5m;
transaction_parsed
| where ingestion_time() > ago(window)
| where severity in ('P1', 'Critical') or status_code >= 500
| summarize
    event_count = count(),
    impacted_services = dcount(service_name),
    sample_trace = any(trace_id),
    latest_event = max(timestamp)
  by alert_key = strcat(service_name, ':', tostring(status_code)), service_name
| where event_count >= 3
| project latest_event, alert_key, service_name, event_count, impacted_services, sample_trace
```



This style of query is intentionally small and operational. It groups related failures, preserves a trace sample for investigation, and produces a stable `alert_key` that the orchestration layer can use for deduplication.



## 3. Eventstream as the Glue



Fabric Eventstream is the managed connector layer between Event Hub and Eventhouse. It removes the need to operate a Kafka cluster, patch brokers, rebalance partitions, or maintain a custom event processor just to move records into the analytical store.



The important capacity pattern is to avoid one Eventstream per source. A workspace should use one Eventstream where practical, with multiple sources in and multiple destinations out. Routing can use event properties such as `source`, `eventType`, or `route` to send records to the correct KQL table.



For the security platform, this means activity logs, application health checks, alert actions, and policy compliance events can share the same managed event-processing backbone while still landing in separate raw tables for clean ownership and replay.



| Eventstream Role | What It Replaces | Operational Benefit |
| --- | --- | --- |
| Source connector | Custom Event Hub readers | Fabric-managed authentication and ingestion |
| Mapper / router | Lightweight stream processor code | Routes fields to KQL tables without a service to host |
| Destination writer | Custom Kusto ingestion client | Direct Eventhouse landing with minimal moving parts |



## 4. Eventhouse + KQL



Eventhouse is the hot analytical tier. Raw tables capture the event exactly as received; parsed tables make those events queryable; materialized views pre-aggregate common operational questions such as failures by service, latency bands, and active security alerts.



KQL is the right language for this workload because it is built for time windows, pattern matching, dynamic JSON, summarization, and interactive investigation. Operators can move from an alert tile to a trace-level query without switching storage engines.



The SPA's KQL update-policy panel is a simplified version of this contract. A raw event is parsed into typed columns: timestamp, service name, level, status code, and message. Production queries extend that with correlation IDs, resource IDs, tenant placeholders, normalized severity, and alert routing keys.



### Parse Function Pattern



```text
.create-or-alter function fn_parse_security_event() {
  security_raw
  | extend parsed = parse_json(raw_event)
  | project
      timestamp = coalesce(todatetime(parsed.eventTime), ingestion_time()),
      service_name = tostring(parsed.serviceName),
      trace_id = tostring(parsed.traceId),
      severity = tostring(parsed.severity),
      status_code = toint(parsed.statusCode),
      resource_id = tostring(parsed.resourceId),
      message = tostring(parsed.message),
      payload = parsed
}
```



After the hot period, OneLake shortcuts let downstream workspaces expose Eventhouse or Lakehouse data without duplicating every byte. That supports colder analytics, compliance review, and BI-friendly aggregation while keeping real-time operations in KQL.



## 5. Retention Tiers



Retention is a cost and usability decision. The hot tier should keep enough data for incident response, failed deployment triage, and short-term trend analysis. Older data should remain discoverable, but it does not need the same compute profile as an active outage.



| Tier | Storage | Retention | Use Case |
| --- | --- | --- | --- |
| Hot | Eventhouse KQL tables | 30 days | Live dashboards, alert queries, incident response, replay of recent producer changes |
| Warm / Cold | OneLake shortcut to Lakehouse tables | Project-defined | Historical trend analysis, Power BI models, department-owned views |
| Archive | Azure Storage account lifecycle tier | Compliance-defined | Long-term evidence, legal hold, low-frequency retrieval |



This tiering strategy avoids treating every byte as a premium SIEM record forever. Security-relevant detections can still flow to Microsoft Sentinel or downstream incident systems, while high-volume telemetry uses the storage and query engine that matches its lifecycle.



## 6. Alert Orchestration



Alerting is where real-time analytics becomes operations. A KQL query can identify candidate alerts, but a durable workflow decides what to do next: deduplicate repeated signals, suppress known maintenance windows, create tickets, send Teams cards, email on-call roles, and mark the alert as ticketed.



Azure Durable Functions fits this pattern because the fan-out/fan-in model is explicit. One orchestrator reads the active alert set, starts one activity per alert, waits for completion, records outcomes, and can retry transient failures without sending duplicate notifications.



The security platform uses this separation to keep detection logic in KQL and side effects in code. KQL answers, “What is happening?” Durable Functions answers, “Who needs to know, and have we already told them?”



| Concern | Where It Lives | Reason |
| --- | --- | --- |
| Detection query | Eventhouse KQL | Fast time-window filtering and summarization |
| Deduplication | Durable orchestration state + alert key | Prevents notification storms during a single incident |
| Suppression | Config table or function settings | Maintenance windows should not change query logic |
| Actions | Durable activities | Tickets, Teams, and email are side effects with retry needs |



### Operational Guardrails



A production version of this pipeline needs guardrails that are visible to both platform and application teams. Each producer should publish a versioned envelope, include a trace identifier, and avoid placing secrets or personal data in message bodies.



Each ingestion component should also expose health signals. Event Hub lag, Eventstream destination failures, Eventhouse ingestion errors, and Durable Function retry counts are separate failure modes. Treating them separately makes incident triage faster.



The runbook should include a replay path. Event Hub retention and Eventhouse ingestion tracking make it possible to replay a small window after a parser fix without asking application teams to re-emit historical events.



| Guardrail | Why It Matters | Example Check |
| --- | --- | --- |
| Schema version | Allows parsers to evolve safely | Reject or quarantine unknown major versions |
| Trace identifier | Links alerts back to application requests | Require non-empty `trace_id` for transaction events |
| Dead-letter route | Prevents bad payloads from blocking good data | Send parse failures to a quarantine table |
| Replay window | Supports recovery after mapping defects | Document Event Hub retention and consumer checkpoints |



### Microsoft Build 2026 Takeaway



The pattern is intentionally Microsoft-native. Event Hubs absorbs producer traffic, Fabric Real-Time Intelligence handles streaming and KQL analytics, OneLake provides the lake boundary, Durable Functions coordinates side effects, and Sentinel remains available for security correlation where SIEM semantics are required.



That mix matters because the goal is not to build another bespoke logging platform. The goal is to make operational telemetry queryable within seconds, keep long-term storage economical, and preserve a clear path from detection to accountable action.



| Build Demo Layer | Production Responsibility | Evidence to Show |
| --- | --- | --- |
| Animated event flow | Producer-to-Event Hub contract | Sample payload, partition key, and replay notes |
| KQL panel | Parser and detection ownership | Function definition, update policy, and alert query |
| Alert status | Durable side-effect workflow | Dedup key, suppression rule, and notification result |



The end result is a pipeline that is real-time without being fragile: event-driven ingestion, managed stream routing, hot KQL analytics, lifecycle-aware retention, and durable alert handling that can be explained from the SPA all the way to production architecture.
