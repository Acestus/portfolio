---
title: "Microsoft Fabric CI/CD"
date: 2026-11-18
draft: false
tags: ["microsoft-fabric", "cicd", "github-actions", "oidc"]
summary: "The Acestus release pattern for source-controlled Fabric definitions, immutable promotion, and evidence that follows each environment."
---

Fabric delivery needs a clear answer to a simple question: which reviewed definitions reached this workspace, and what evidence qualified them? The Acestus release pattern carries source identity and verification evidence through Development, Staging, and Production.

This is a reusable architecture for definition-based delivery. It does not describe a live workspace or certify a deployed system.

## Promote a retained source snapshot

Keep supported Fabric item definitions and environment replacement rules in Git. Qualify an exact source commit, retain its release package, and publish that package with explicit substitutions for each environment.

The package is a snapshot of reviewed definitions. It is not an export of whatever happens to exist in Development at promotion time. Runtime data, workspace permissions, connection access, and notebook execution still need their own controls.

| Stage | Evidence to retain |
| --- | --- |
| Pull-request qualification | Contract and behavior checks without cloud credentials |
| Development publication | Source commit, retained package, publisher run and attempt |
| Development verification | Results bound to that exact publication |
| Staging promotion | Same release package and reviewed target mappings |
| Staging verification | Qualification receipt for the selected release |
| Production promotion | Matching evidence chain and environment approval |

Build once and retain the package long enough to support promotion and recovery. If the required artifact expires, stop the operation rather than rebuilding and describing the result as the same release.

## Give shared workflows a clear contract

Application repositories should declare triggers, inputs, permissions, and the release lock. Shared orchestration should own target validation, publication, and provenance checks.

The boundary might look like this:

```text
Application caller
  → exact source revision and declared item scope
Shared release workflow
  → qualification, target validation, package retention, publication
Verification workflow
  → receipt tied to publisher run, attempt, source, and package
Promotion workflow
  → validate prior evidence, select target, publish retained definitions
```

Treat this as a design contract to implement and test, rather than the name of an installed workflow. Pin shared workflow calls to reviewed immutable revisions. Do not accept arbitrary deployment scripts or credentials as casual caller inputs.

Serialize releases when concurrent updates could race. A non-cancelling lock prevents a newer release from interrupting an environment update halfway through, but it does not replace provenance validation.

## Keep workspace items and Warehouse schemas distinct

Fabric repositories can contain multiple delivery surfaces. Workspace-item publication and Warehouse schema delivery need separate ownership and verification.

For workspace items, declare supported item types, publication scope, environment replacements, and any cleanup behavior. If reconciliation can delete orphaned items, document and test that effect explicitly.

For a Warehouse path, explain which tool creates or validates the shell, which operation deploys the DACPAC, and which SQL check verifies the schema. Use path filters and explicit scope so a schema-only change cannot accidentally publish unrelated notebooks.

A successful SQL schema check proves something about the schema. It does not prove that a notebook ran or that a pipeline produced correct data.

## Bind evidence to the exact attempt

A run ID alone is an incomplete release identity because a workflow can be rerun. Record the attempt alongside the repository, source commit, package identity, workflow revision, and release contract revision.

Before promotion, verify that every required receipt belongs to the selected release and the applicable latest attempt. Reject missing targets, skipped jobs, cancelled runs, stale receipts, and mismatched sources. An old successful attempt should not silently qualify a newer failed attempt.

Keep Production deliberate. The proposed pattern uses a manual operation and protected environment approval. A confirmation phrase can catch a mistaken selection, but it is not a substitute for the approval gate.

## Treat environment mappings as release inputs

Use environment-scoped OIDC identities and grant only the required workspace access. Keep actual workspace and identity identifiers in reviewed configuration, outside public examples.

Validate replacement rules for workspace references, item references, endpoints, and connections. Reject empty values, accidental duplicate targets, and mappings that send Staging or Production back to Development.

Name verification jobs according to what they establish: local behavior, cloud inventory, live Fabric execution, or runtime data validation. This keeps a green workflow from promising more than its checks observed.

## A reusable implementation prompt

Supply the item inventory, sanitized replacement rules, workflow contracts, README, and offline tests:

```text
Implement a source-controlled Fabric release lifecycle in this repository.
Read the architecture guide, delivery README, item metadata, replacement
rules, callers, shared workflow contract, and tests before editing.

Qualify pull requests without cloud credentials. Publish only declared item
types from the exact qualified source. Retain the release package and reuse
it across environments with reviewed substitutions and scoped OIDC identities.

Require matching package, source, run, attempt, and workflow provenance.
Reject missing targets, stale evidence, skipped checks, and mismatches.
Keep Production manual and protected by environment approval.
Separate Warehouse schema delivery and publisher cleanup side effects.

Add focused offline contract checks and update verification and recovery
instructions. Use fictional Acestus examples only. Preserve unrelated work.
Do not dispatch workflows, deploy, or change access. Report limitations.
```

The release record should explain what moved, where it moved, and what qualified it. That makes promotion reviewable and gives recovery a concrete artifact to start from.

## Continue the series

- [Azure VM Patch Management as Code](/articles/azure-vm-patch-management-as-code/)
- [Azure Functions Python CI/CD](/articles/azure-functions-python-cicd/)
- [AI Software Factory: Skills, .NET CLI, and Repository Context](/articles/ai-software-factory/)
