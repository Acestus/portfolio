# ADR-002: Deployment Stacks for drift protection

**Status:** Accepted  
**Date:** 2024-10

## Context

Resources modified outside IaC pipelines caused silent drift. Traditional deployments don't prevent manual changes.

## Decision

Use Azure Deployment Stacks with deny-settings (`denyWriteAndDelete`) and `actionOnUnmanage=deleteResources` for all production resource groups.

## Consequences

- Zero manual drift in production
- Engineers must go through IaC pipeline for all changes
- Break-glass PIM activation needed for emergency fixes
- Deployment stack updates are slightly slower than raw deployments
