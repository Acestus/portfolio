# ADR-005: Event Hub for centralized log ingestion

**Status:** Accepted  
**Date:** 2024-12

## Context

Logs scattered across Log Analytics workspaces, storage accounts, and Application Insights. No unified real-time view.

## Decision

Route all infrastructure and application logs through a central Event Hub namespace. Use Fabric Eventstream to fan-out to Eventhouse (hot) and Lakehouse (cold).

## Consequences

- Single ingestion point simplifies monitoring
- Real-time KQL queries via Eventhouse
- Event Hub becomes a critical path — needs geo-redundancy
- Cost savings by replacing per-resource Log Analytics with centralized pipeline
