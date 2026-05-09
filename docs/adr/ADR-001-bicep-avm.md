# ADR-001: Use Bicep AVM over raw ARM templates

**Status:** Accepted  
**Date:** 2024-09

## Context

Team spent excessive time writing boilerplate ARM JSON. Microsoft's Azure Verified Modules provide tested, well-documented Bicep modules with consistent interfaces.

## Decision

Adopt AVM modules from the Bicep public registry (`br:mcr.microsoft.com/bicep`) as the primary IaC building blocks. Wrap in thin composition modules per workload.

## Consequences

- Faster onboarding — engineers learn one module interface
- Automatic security baselines from Microsoft
- Version pinning required — breaking changes between AVM versions
- Custom resources still need raw Bicep
