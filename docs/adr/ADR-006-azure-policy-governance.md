# ADR-006: Azure Policy for governance at scale

**Status:** Accepted  
**Date:** 2024-09

## Context

Multiple subscriptions with inconsistent tagging, naming, and security configurations. Manual audits don't scale.

## Decision

Implement Azure Policy as code. Custom policies for CAF naming, required tags, and allowed SKUs. Assign at management group level with exemptions for exceptions.

## Consequences

- Consistent governance across all subscriptions
- New resources automatically validated
- Policy conflicts require careful initiative design
- Exemption workflow needed for legitimate exceptions
