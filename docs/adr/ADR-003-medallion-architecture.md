# ADR-003: Medallion architecture for Fabric pipelines

**Status:** Accepted  
**Date:** 2024-11

## Context

Ad-hoc data pipelines led to inconsistent data quality. Analysts couldn't trust numbers across reports.

## Decision

Implement Bronze → Silver → Gold medallion pattern. Bronze is raw/append-only, Silver is cleansed/deduplicated, Gold is business-ready star schemas.

## Consequences

- Clear data lineage and quality gates
- Analysts only query Gold layer
- Increased storage from multi-layer approach
- Reprocessing requires replaying from Bronze
