---
title: "Engineering delivery architecture"
description: "The complete supplied specification for independent repositories, shared CI, immutable delivery, Bicep, OIDC and independently governed ATDD."
space: "Architecture & delivery"
date: "2026-11-03"
draft: false
tags: ["agentic-development", "atdd", "github-actions", "dotnet", "bicep", "infrastructure"]
---

> **Source:** Supplied specification version 1.0, evidence dated November 3, 2026. Its recorded baseline concerns the reference system described here; it is not a current audit or deployment receipt for this website. Requirements and proposed examples retain their original status.

An AI coding agent can propose changes across independent repositories, but it does not define success, approve its own tests, or bypass delivery controls. This specification combines a CLI-first operations platform, shared GitHub workflows, independent acceptance contracts, infrastructure as code, and a Hugo reference application into one reproducible engineering system.

Specification version: 1.0

Evidence date: 2026-11-03

Audience: engineers and AI agents reconstructing the delivery process

Publication scope: sanitized technical architecture; no employer identifiers, business data, private endpoints, or production inventory

## 1. How to use this specification

This is both an architecture description and a reconstruction contract. It is not a claim that every described capability is already operational.

| Label | Meaning |
| --- | --- |
| Observed | Supported by inspected source or command help. This does not prove a successful hosted deployment. |
| Required | A normative requirement for the reconstructed system. |
| Proposed | A reference implementation or extension that still needs implementation, review, and execution evidence. |
| Blocked | A prerequisite is absent; the workflow must not report success. |

MUST indicates a requirement. SHOULD indicates a default with a documented exception. Examples use neutral repository roles, synthetic data, reserved example domains, and placeholder configuration. Replace placeholders before execution; never invent a commit SHA, approval, deployment identity, or passing result.

The page body is intended to stand alone. It deliberately omits internal wiki cross-links, original organization and application names, ticket histories, resource names, account identifiers, and personal paths. Confluence's hosting URL and author metadata are outside the sanitized page body.

### Reading order

Read sections 2-5 for architecture and control boundaries, 6-10 for delivery, 11-14 for acceptance and the reference application, and 15-18 for the embedded style guide and reconstruction checklist.

## 2. Architecture: independent repositories, one delivery model

Use independent Git repositories rather than a giant repository containing every application. Each repository owns its source, history, reviews, and deployable units. Shared automation is versioned like a product.

| Repository role | Responsibility | Must not become |
| --- | --- | --- |
| projects | Packaged .NET operations CLI, Copilot skills, local records, documentation publishing, and explicit cross-domain orchestration | An unreviewed alternate deployment engine |
| iac-infra | Reusable workflows, typed release engines, reusable infrastructure modules, shared platform stacks, and infrastructure operator commands | A copy of every application's business logic |
| acceptance-tests | Independently reviewed executable behavior contracts, public-boundary drivers, fixtures, scenario inventory, and evidence reporting | An application-internals test project |
| code-conventions | Versioned engineering style guide and repository adoption instructions | A README that merely promises conventions |
| dotfiles | Thin Fish launchers and local .NET helpers such as gpr; reference-only personal configuration | A secret store or authoritative acceptance service |
| Application repositories | Runtime implementation, component tests, thin delivery callers, application adapters, and explicitly owned infrastructure | Copies of the platform workflow engine |
| template-functions or equivalent template | A reviewed starting point for the selected application delivery contract | A permanently forked platform implementation |

Reference topology:



```text
Human intent + approved behavioral examples
                    |
                    v
Copilot instructions and task-specific skills
                    |
                    v
Projects CLI -----> owning application's implementation
       |                         |
       |                    gpr / app-authored PR
       |                         |
       v                         v
Independent contracts       unprivileged PR checks
and reviewed evidence            |
       |                         v
       +------------------> protected merge
                                 |
                                 v
                         main-source publication
                                 |
                                 v
                    shared, immutable release platform
                                 |
                    dev -> staging -> production
                                 |
                                 v
                      exact-candidate verification
```

Independent contracts are a trust boundary, not just another arrow in CI. A separate repository alone does not prevent an agent from modifying tests or provide safe candidate execution.

### Local workspace contract

Work in existing independent Linux checkouts under `~/git/<repository>`. Ubuntu on WSL is a primary development environment. Create branches in the existing checkout; do not create worktrees, duplicate clones, or alternate working directories.

Inspect local changes before editing and preserve unrelated work. If overlapping changes prevent safe progress, stop. Do not silently relocate work, stash someone else's changes, or reset the checkout.

Temporary repositories created only by automated tests are permitted. They are fixtures, not working checkouts. A development container is optional tooling, not a prerequisite for ordinary Linux work or an isolation boundary for untrusted candidates.

## 3. Source-of-truth and dependency rules

| Concern | Authority | Relationship to other records |
| --- | --- | --- |
| Application behavior | Human-approved executable acceptance revision | Prose describes intent; executable examples make selected outcomes observable |
| Runtime implementation | Owning application repository | Internal tests give fast feedback but do not replace independent contracts |
| Infrastructure desired state | Explicitly owning IaC repository or application infrastructure directory | Deployed state can drift; source alone does not prove current cloud state |
| Shared delivery behavior | Published release-platform commit | Thin callers bind to a reviewed immutable revision |
| Style | Versioned code-conventions guide | Local instructions reference it and record justified exceptions |
| Ticket status and native fields | Remote work-management system | Local Markdown is a working narrative, not automatic synchronization |
| Local readiness and indexes | CLI-managed local state | SQLite projections and ATDD sidecars are not protected remote approvals |
| Published documentation | Confluence | Markdown is the versioned authoring surface; publication must be explicit |

Each repository MUST contain a repo-architecture.md explaining purpose, boundaries, layout, primary commands, delivery flow, sources of truth, and current limitations. Instructions MUST route readers there first and link the relevant workflow or skill.

Architecture documents are maps, not a replacement for implementation. Update them when a boundary, command, source of truth, deployment flow, or trust assumption changes.

Cross-repository changes require separate branches and PRs. Publish and review a platform capability before updating application callers to its real commit. A batch command is not a distributed transaction; earlier submissions remain if a later repository fails.

## 4. Copilot skills and the Projects CLI

GitHub Copilot agent skills provide task guidance. The .NET CLI performs operations. Do not place a second implementation of business logic in a skill prompt.

### Required separation

| Layer | Owns | Example |
| --- | --- | --- |
| Repository instructions | Navigation, boundaries, mandatory safety rules | Read architecture, select the owning repository, preserve local changes |
| Skill | Task sequence, approval points, supported command invocation | Investigate, agree examples, run readiness checks, publish when authorized |
| CLI command edge | Parse arguments, validate inputs, render output, map exit codes | dotnet projects infra deploy-bicep ... |
| Typed service/workflow | Decisions, orchestration, typed results | Validate target selection and promotion eligibility |
| Adapter | Process, HTTP, cloud SDK, clock, filesystem, or database effects | Execute Azure CLI through an injectable process boundary |
| Remote authority | Actual permissions, resources, protected reviews, and deployed state | GitHub ruleset or Azure resource |

### Observed command forms




```bash
cd ~/git/projects
dotnet projects --help
dotnet projects infra --help
dotnet projects infra doctor
dotnet projects ticket atdd --help
dotnet projects confluence --help
```

Use the ready, manifest-pinned dotnet projects tool for ordinary operations. A ready tool does not need rebuilding for each invocation. Restore it only when missing; pack source only when the pinned package is unavailable or current-source development explicitly requires it. Authentication and runtime errors do not authorize a fallback to a different implementation.

Source execution remains appropriate for development, CI, and intentionally file-based helpers. A .NET 10 file app behind gpr is such a helper; it is not a reason to run the entire Projects CLI from source routinely.

### Verb-Noun vocabulary

| Verb | Meaning | Example public intent |
| --- | --- | --- |
| Get | Retrieve a known resource | Get-ReleaseReceipt |
| Find | Search or filter a collection | Find-WorkflowConsumer |
| Test | Validate and return a result | Test-ReleaseProvenance |
| New | Create state | New-AcceptanceContract |
| Set | Modify existing state | Set-EnvironmentConfiguration |
| Remove | Delete state | Remove-SyntheticFixture |
| Invoke | Perform an operation or orchestrate a lifecycle | Invoke-ReleaseLifecycle |
| Convert | Transform a representation | Convert-MarkdownToStorage |

These are naming examples, not promises of existing commands. Preserve supported CLI syntax, including established noun-group forms such as ticket atdd test-ready. Use intent-consistent names in new APIs without renaming established commands casually.

## 5. Agent authorship, human authority, and credentials

The AI agent implements a proposed change. A GitHub App supplies the explicit automation identity that authors organization PRs. These are separate concepts: app authorship identifies the submission path; it does not prove who wrote the code or that the code was approved.

Use a neutral app identity such as Engineering Agent when reconstructing the system.

| Operation | Identity | Constraint |
| --- | --- | --- |
| Local commit and push | Normal operator Git authentication | Preserve repository permissions and attribution |
| Organization PR creation | Repository-scoped GitHub App installation token | App must be installed for that repository |
| PR lookup and auto-merge request | Normal operator GitHub authentication | GitHub rules remain authoritative |
| Personally owned repository PR | Authenticated repository owner's identity | Do not assume an app can be installed on every account type |
| Executable acceptance approval | Independent human reviewer | Neither candidate agent nor app may self-approve |
| Cloud delivery | Environment-bound OIDC identity | Separate from PR-author credentials |
| Runtime access | Workload managed identity where supported | Separate from deployment control-plane access |

The PR app needs only the capabilities required by its helper, such as Contents: read and Pull requests: write. Keep the private key in an approved secret store. Local configuration contains references, not key bytes. Obtain installation tokens in memory, scope them to PR creation, and never print or save them.

Missing installation, private-action sharing access, secret-store access, or personal write access is a blocker. Do not change global login, silently switch identities, approve the agent's own PR, weaken review requirements, or close a mismatched-author PR automatically.

## 6. GPR: the commit-to-PR-to-auto-merge interface

gpr is a local Fish shortcut backed by .NET automation, not a GitHub-provided command. Its normal Fish entrypoint requests auto-merge.

### Observed sequence


1. Resolve the current repository and branch; reject unsupported or ambiguous state.

2. Inspect changes and fetch the target branch. On main, create a feature branch in the same checkout.

3. Verify the selected PR identity's access before submission.

4. Generate a commit message, commit eligible changes, and push using normal Git authentication.

5. Reuse an eligible PR for the current branch, or create one with the selected author.

6. Request gh pr merge ... --auto --squash using normal operator authentication.

7. Print the PR URL and retained local branch. Do not wait for CI or report that the merge happened.



```bash
cd ~/git/sample-app
git status --short
git diff
git diff --cached
gpr
```

Important: the helper can include tracked and untracked eligible changes, not merely a carefully preselected staged subset. Inspect the complete working tree first. If unrelated work would be committed, do not invoke the broad helper; use a scoped manual commit/push and PR-only creation path instead.

Observed PR-only helper shape, after a deliberate push:



```bash
git push --set-upstream origin feature/example-change
dotnet run --no-cache --file ~/git/dotfiles/scripts/github-app-pr.cs -- --title 'Example change' --body-file /path/to/reviewed-body.md
```

The body file MUST follow the owning repository's PR template. The PR-only helper does not commit, push, approve, or request merging. The path is a required local file, not an instruction to create arbitrary PR content without review.

Use the Fish shortcut or explicit `--auto` when the auto-merge workflow is intended. Direct invocation of the underlying GPR script without `--auto` has a different immediate-merge path; do not treat those entrypoints as interchangeable.

### Completion and recovery

An auto-merge request is not a merge receipt. A failed operation may already have committed, pushed, or created a PR. Inspect preserved state before retrying.

A completed branch with no new edits is skipped. New edits on a completed branch need a fresh branch; changed committed history that could resubmit squash-merged changes must stop for reconciliation. Pending local branches remain until the operator confirms the PR merged and deliberately updates the checkout.

gpr-all sequentially applies this behavior to a configured repository list. The observed batch excludes the independent acceptance repository. A reconstructed batch MUST preflight access, stop at the first failure, and report created/reused PR URLs, no-change results, failures, and repositories not run. It MUST NOT claim rollback across repositories.

## 7. Auto-merge is controlled by repository rules

GitHub auto-merge delegates the eventual merge to GitHub after requirements are satisfied. It is not a bypass and does not create missing requirements.

Before enabling it, configure the repository:

| Control | Required effect |
| --- | --- |
| Allow auto-merge and squash merging | Permit the helper's requested merge mode |
| Protect main with a ruleset | Require PR-based changes and prevent unauthorized bypass |
| Required status checks | Bind the actual intended jobs; a test that is merely present does not block merging |
| Required owner review on sensitive paths | Protect acceptance contracts, release engines, workflow trust, and authorization policy |
| Stale approval dismissal | Changed executable contracts need renewed independent review |
| Protected deployment environments | Restrict cloud delivery sources and require approval where intended |
| Merge queue, if configured | Validate queue commits with required checks, including merge_group support where needed |

Use stable, distinct job/check identifiers. Display-name cleanup can change what humans see; provenance and rules may depend on exact workflow paths or check contexts. Update consumers and protections deliberately.

A repository with no required test checks may merge immediately. That is not evidence that tests passed. The observed setup includes such an exception; this specification's default reconstruction requires real checks for protected engineering repositories.

### Required negative tests

Demonstrate that a deliberately failing required check prevents merging, a missing required check cannot satisfy the gate, an unapproved sensitive change remains blocked, and an unauthorized deployment source cannot acquire delivery privileges. Configure external controls explicitly; checked-in files alone do not enable them.

## 8. Shared workflows: central engine, thin callers

Reusable GitHub Actions workflows centralize behavior behind workflow_call. Application callers own triggers, minimal permissions, dispatch inputs, concurrency selection, and the published platform pin.

The platform owns repeatable build, provenance, artifact handoff, target validation, promotion, and recovery logic. Application adapters own meaningful application tests, build-tool setup, runtime configuration, and semantic smoke checks.

### Sanitized thin caller template

This is a non-executable template until PLATFORM_OWNER and REVIEWED_PLATFORM_COMMIT are replaced. The latter MUST be the real full 40-character commit of a published, reviewed platform. Never use a fabricated all-zero digest.



```yaml
name: Test-PullRequest
on:
  pull_request:
permissions:
  contents: read
  actions: read
jobs:
  release:
    uses: PLATFORM_OWNER/iac-infra/.github/workflows/_release-validate-pr.yaml@REVIEWED_PLATFORM_COMMIT
```

Do not pass arbitrary credentialed scripts or arbitrary cloud destinations through reusable inputs. Use typed, reviewed application configuration and platform-approved target mappings.

### Workflow naming and compatibility

Use PascalCase Verb-Noun display names such as Test-PullRequest, Publish-Development, Promote-Staging, Promote-Production, Restore-Production, and Invoke-DotnetLifecycle. New workflow files use .yaml.

Preserve established reusable filenames, job/check identifiers, and producer allowlists unless executing a reviewed coordinated migration. Renaming a file referenced by another repository is an API change, even if its contents are identical.

### Contract families are not interchangeable

| Family | Observed distinction |
| --- | --- |
| Application-adapter .NET lifecycle | Function artifacts, application-specific frontend behavior, qualification receipts, promotion, and retained-artifact recovery |
| Profile-based .NET lifecycle | Reviewed target profiles and synthetic application/mock delivery; current production scope differs |
| Python lifecycle | Its own build-once publication and retained-artifact promotion contract |
| Fabric lifecycle | Definition publication and workspace-specific qualification, not promotion of a Function ZIP |
| Bicep/Terraform delivery | Infrastructure desired-state operations, not application package release |
| Legacy runtime deploy workflows | Compatibility entrypoints; not necessarily complete promotion/recovery lifecycles |

Inventory consumers before retiring a reusable entrypoint. Search a declared scope at exact repository snapshots and inspect job-level uses fields, not just text matches. Default-branch visibility does not cover hidden repositories, old branches, retained artifacts, or external callers. No visible callers is not automatic permission to delete.

### Private source distribution

Allow approved consumers to use the private platform's workflows/actions through GitHub settings. Bind platform source materialization to the exact workflow revision recorded in run metadata.

The observed platform uses GitHub-managed private action distribution rather than a stored cross-repository PAT. A same-repository GITHUB_TOKEN is not a general private-repository read credential. Do not confuse GitHub's managed action-download access with the PR-author app token.

## 9. CI/CD lifecycle and immutable evidence

Use GitHub Actions OIDC with Azure for delivery authentication. Configure trust for the actual repository, protected environment, issuer, audience, and subject format. Do not copy identity values from another installation.

| Stage | Trigger and privilege | Required outcome |
| --- | --- | --- |
| PR qualification | pull_request; unprivileged | Build, inner-loop tests, workflow contracts, infrastructure compilation, acceptance compilation, and permitted offline feedback |
| Optional PR development deployment | Trusted-main consumer of a reviewed producer | Validate repository, event, head, workflow, run/attempt, digest, and target before OIDC; no arbitrary candidate-supplied scripts |
| Main publication | Protected-main push or deliberate dispatch | Build the release artifact once, publish Dev, perform semantic checks, retain the qualified artifact |
| Staging promotion | Explicit main-source operation | Download the exact retained Dev artifact, verify provenance, deploy without rebuilding, qualify and retain evidence |
| Production promotion | Explicit protected operation | Require successful staging identity, exact bytes, approved platform/configuration, durable receipt, and production authorization |
| Production recovery | Explicit protected operation | Restore a previously production-qualified retained artifact after validating the recovery chain |
| Infrastructure maintenance | Separate authorized operation | Change declared infrastructure without implying application code publication |

The optional privileged consumer MUST treat producer output as untrusted until provenance checks pass. Never execute PR code in a privileged pull_request_target job or trust a workflow_run completion by itself.

Use minimal job permissions. PR tests should not have deployment credentials. Grant id-token: write only to jobs that require federation. Restrict write permissions to operations that actually need them.

### Build once means preserve exact bytes

Record source commit, producer workflow path, run ID and attempt, artifact SHA-256, platform commit, target configuration identity, qualification revision, and resulting deployment identity.

Do not rebuild for staging and call it the same release. A PR candidate and a main release build are normally distinct artifacts. Verify each claim against the artifact actually being released.

The observed application-adapter lifecycle promotes the immutable Function package. Automatic Hugo publication is a Dev component. Staging/production frontend setup and frontend recovery are separate; a Function ZIP is not an atomic frontend/backend/database release.

### Failure, concurrency, and recovery

Serialize operations targeting the same environment. Avoid cancellation policies that interrupt a live mutation and falsely report a clean state. A failed deployment must block downstream qualification.

Missing receipts, expired artifacts, wrong attempts, mismatched digests, stale target configuration, unexpected redirects, authorization failures, or malformed health content MUST block. Do not substitute "host reachable" for semantic success.

Recovery is not automatically a Git revert, database restore, slot swap, or infrastructure rollback. Specify the exact component being restored. Preserve required artifacts and receipts for a documented retention window; if they expire, recovery must fail explicitly.

## 10. Dependabot: maintenance through the same review path

Dependabot version updates create dependency PRs. They do not automatically establish compatibility or authorize a merge.

Observed configuration in the infrastructure repository schedules weekly updates for GitHub Actions, a development-container Docker definition, and Terraform. That configuration alone does not demonstrate coverage for every nested module, NuGet project, frontend package, or application repository.

Reconstruction requirements:

1. Inventory package ecosystems and actual manifest directories per repository.

2. Configure .github/dependabot.yml for those locations and supported ecosystems.

3. Keep SDK/runtime/tool versions deliberate; use lockfiles and locked restore where supported.

4. Apply the same meaningful tests, sensitive-path reviews, and deployment gates to dependency PRs.

5. Review platform-pin updates against application compatibility and provenance assumptions.

6. If desired, implement a narrowly scoped policy to request auto-merge for eligible dependency PRs. This is separate automation, not a default Dependabot capability.

Minimal proposed Actions update configuration:



```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
```

Dependabot is a distinct PR author from the engineering app. Do not relabel its authorship to make an identity diagram look uniform. Dependency PRs may have restricted tokens/secrets; keep qualification credential-free.

## 11. Infrastructure as code: Bicep stacks and environments

Bicep expresses Azure desired state. Reusable modules define building blocks; stack entrypoints compose a deployable unit; environment parameter files provide reviewed variation.

Required reference layout:



```text
iac-infra/
  repo-architecture.md
  modules/
    bicep/
      storage/
      monitoring/
  stacks-bicep/
    sample-site/
      README.md
      main.bicep
      dev/
        main.dev.bicepparam
      stg/
        main.stg.bicepparam
      prd/
        main.prd.bicepparam
  scripts/
  src/
  tests/
  .github/workflows/
```

An application's explicitly owned `infra/<workload>/` directory can use the same structure. Do not declare the same resource in both application and shared stacks. Choose one owner and document the boundary.

### Entry-point and parameter contract

main.bicep declares the deployment scope, validated inputs, reusable module composition, cross-resource wiring, and nonsecret outputs. Prefer Azure Verified Modules where they fit; use repository-local modules for genuinely shared behavior and stack-local helpers for specialized wiring.

Keep the resource graph in one entrypoint rather than separate copied templates per environment. Environment directories contain .bicepparam files and approved overlays, not a secret-bearing fork of the stack.

Proposed minimal layout illustration, not a complete website stack:



```bicep
targetScope = 'resourceGroup'
@allowed([
  'dev'
  'stg'
  'prd'
])
param environment string
param location string = resourceGroup().location
resource hostingPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'plan-sample-${environment}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {}
}
output hostingPlanId string = hostingPlan.id
```

Example dev/main.dev.bicepparam:



```bicep
using '../main.bicep'
param environment = 'dev'
param location = 'westus2'
```

The plan illustrates parameterization only; it is not the selected hosting recommendation for the Hugo reference application. A full workload needs reviewed compute, storage, identity, network, telemetry, and cost decisions.

### Operator path

After defining and reviewing the actual stack, the existing Projects surface supports:



```bash
cd ~/git/projects
dotnet projects infra deploy-bicep --stack sample-site --env dev --action validate
dotnet projects infra deploy-bicep --stack sample-site --env dev --action show
```

sample-site is a proposed stack name, not a claim that it already exists. Validation may contact Azure and requires approved access. Inspect the owning IaC operator's supported what-if/stack actions before execution; do not assume validate is a complete deployment diff.

Deployment is a separate authorized operation. Review the intended subscription/resource group, planned changes, deletion/detachment behavior, identity scope, and recovery consequences first.

Secret values MUST NOT appear in Bicep parameters, outputs, GitHub variables, generated frontend configuration, logs, or documentation. Use managed identities and secret references. Keep control-plane deployment rights separate from runtime data-plane permissions.

## 12. Full ATDD workflow: examples before implementation

Acceptance-test-driven development (ATDD) starts with agreed observable behavior. Reqnroll binds Gherkin examples to executable .NET tests; it does not by itself make tests independent, approved, safe, or authoritative.

### The six-stage outer loop

| Stage | Action | Persistent evidence | Stop condition |
| --- | --- | --- | --- |
| 1. Agree examples | Human stakeholder and maintainer define preconditions, action, result, boundaries, and safety | Stable scenario IDs and agreed examples | Outcome is ambiguous or not measurable |
| 2. Approve executable revision | Independently review features, bindings, drivers, fixtures, policy, inventory, build/dependencies, and runners | Exact approved revision and execution command | Prose approved but executable surface unseen |
| 3. Observe behavioral red | Run the approved scenario against the baseline | Exact baseline identity, failure assertion, command, target, time, and sanitized evidence | Setup/build/auth failure, skipped tests, or unexpected green |
| 4. Implement one scenario | Change only the owning implementation; use fast inner-loop tests | Scoped source changes and component-test feedback | Agent needs to weaken the approved contract |
| 5. Verify exact candidate | Execute the same approved contract against the exact artifact or deployment | Candidate source/digest, target identity, scenario results, and regressions | Wrong artifact, stale evidence, absent coverage, or unavailable safe runner |
| 6. Review and reapprove changes | Review behavior, refactor while green, refresh evidence; repeat approval for contract changes | Human review and current evidence for every applicable slice | Any approval or evidence no longer matches |

Implement one scenario at a time, keeping earlier scenarios as regressions. Use small behavior slices rather than a large up-front batch of unverified assertions.

An initial scenario that already passes needs investigation: the behavior may already exist or the test may be weak. Do not sabotage production code to manufacture red. Record the observation and agree the correct next step.

### Inner loop versus outer loop

| Inner loop | Outer loop |
| --- | --- |
| Application-owned unit/component tests | Independent user-visible behavior contracts |
| Can exercise internal abstractions | Observe a CLI process, HTTP API, browser, or other public boundary |
| Fast diagnosis and refactoring feedback | Evidence that the agreed outcome is observable |
| Mocks appropriate at dependency boundaries | Controlled downstreams allowed, but never mock the behavior being claimed |
| Maintained with implementation | Executable changes need independent human approval |

Do not reference application assemblies or import application test helpers into the independent suite. Reuse a small public-boundary driver only when it reduces real duplication; do not build a generic framework for one example.

### Independent Reqnroll suite shape



```text
acceptance-tests/
  repo-architecture.md
  AcceptanceTests.slnx
  suites/
    SampleSite.Acceptance/
      SampleSite.Acceptance.csproj
      Features/
        Reading.feature
      Steps/
        ReadingSteps.cs
      Drivers/
        SiteDriver.cs
      Fixtures/
      Reporting/
      test-cases.json
      run-policy.json
      packages.lock.json
  tests/
    Harness.SelfTests/
  tools/
    Acceptance.Reporting/
  .github/
    CODEOWNERS
    workflows/
```

SampleSite.Acceptance is proposed, not an existing suite. Select reviewed compatible .NET, Reqnroll, test SDK, xUnit, runner, and optional Playwright versions; pin them and include execution-affecting files in review.

Features use domain language. Bindings delegate to drivers and assert outcomes. Drivers handle process/API/browser details. Fixtures own synthetic setup and bounded cleanup. Inventories define required scenario IDs; reporting correlates actual execution with them.

The suite MUST discover and execute its feature scenarios. An unbound .feature, generated source file, successful compilation, or test run selecting zero scenarios is not acceptance coverage.

## 13. ATDD readiness, provenance, and honest reporting

The observed Projects CLI maintains a local contract and human-reviewed result ledger. It does not execute the recorded commands or independently authenticate the reviewer.

### Observed command interface




```bash
dotnet projects ticket atdd get --file "$contract"
dotnet projects ticket atdd approve --file "$contract" --approval-hash "$contract_hash" --reviewer "$reviewer"
dotnet projects ticket atdd record-result --file "$contract" --approval-hash "$contract_hash" --reviewer "$reviewer" --evidence-file "$observation"
dotnet projects ticket atdd test-ready --file "$contract" --stage implement --scenario "$scenario_id"
dotnet projects ticket atdd test-ready --file "$contract"
```

Populate variables from the reviewed local contract and current CLI output. Approval commands are permitted only after the actual human approves that executable revision. A reviewer string is not authority.

Keep the local ledger outside the acceptance root. Bind testFiles to the independent acceptance root and implementationPaths to the owning source root; those roots must not overlap. Include assertions, drivers, fixtures, inventory, policies, project/build configuration, dependencies, and runner surfaces that affect execution.

Proposed local contract shape for the sample application:



```json
{
  "schemaVersion": 1,
  "provider": "jira",
  "key": "ENG-123",
  "mode": "code",
  "rationale": "",
  "sourceRoot": "~/git/sample-app",
  "acceptanceRoot": "~/git/acceptance-tests",
  "implementationPaths": [
    "apps/reading/site"
  ],
  "scenarios": [
    {
      "id": "SITE001",
      "given": "The synthetic catalogue contains 3 articles",
      "when": "A reader opens the catalogue page",
      "then": "The reader sees 2 titles and can open the next page",
      "command": "dotnet test suites/SampleSite.Acceptance/SampleSite.Acceptance.csproj --filter FullyQualifiedName~SITE001",
      "expectedFailure": "Expected 2 article titles",
      "testFiles": [
        "suites/SampleSite.Acceptance/Features/Reading.feature",
        "suites/SampleSite.Acceptance/Steps/ReadingSteps.cs",
        "suites/SampleSite.Acceptance/Drivers/SiteDriver.cs",
        "suites/SampleSite.Acceptance/SampleSite.Acceptance.csproj",
        "suites/SampleSite.Acceptance/packages.lock.json",
        "suites/SampleSite.Acceptance/test-cases.json",
        "suites/SampleSite.Acceptance/run-policy.json"
      ]
    }
  ]
}
```

ENG-123 is a synthetic schema example, not an actual ticket. Save the contract outside acceptance-tests; replace the key, paths, command, and expected assertion with the human-reviewed implementation. Confirm the test filter discovers and executes the intended scenario. Add every other execution-affecting file to the reviewed scope, including fixtures, inherited build configuration, runner selection, and dependency configuration where applicable.

Capture contract and source identities before execution. Changed contract bytes or commands require renewed approval. Changed implementation invalidates passing evidence and requires a fresh run. Do not attach old output to new hashes.

### Required run record

| Field | Meaning |
| --- | --- |
| Scenario IDs and inventory revision | What was required and what actually executed |
| Approved contract identity | Exact executable revision reviewed by humans |
| Candidate source commit and artifact SHA-256 | Which implementation bytes were observed |
| Producer/platform/run/attempt | How those bytes were produced |
| Target and deployment identity | Where the candidate ran, not merely a friendly environment label |
| Start/end time and freshness policy | Whether evidence remains fit for the decision |
| Result and expected/actual observation | Real behavior, not an exit code alone |
| Sanitized evidence reference | Access-controlled supporting output with a retention policy |

### Result vocabulary and trust

The independent reporter currently emits feedback-pass or blocked, not accepted. Empty live inventories and disabled live policies mean live acceptance is unavailable. They do not mean "nothing failed, therefore accepted."

The implemented harness reporter checks freshness within one hour and blocks zero results or missing, skipped, or duplicate required scenarios. Those checks improve feedback integrity; they are not an independent authorization service.

Distinguish:

| Claim | What it establishes |
| --- | --- |
| Harness self-tests passed | Test infrastructure works for synthetic cases |
| Local controlled-downstream feedback passed | Reviewed local source met selected examples with synthetic dependencies |
| Application-owned deployed checks passed | Selected deployed behavior was observed by the app's own verifier |
| Independent candidate verification passed | Reviewed independent scenarios observed the exact candidate through the approved execution boundary |
| Human accepted | A person authorized to decide accepted the documented outcome |

### Safe execution boundary

Reviewed local source with human-approved synthetic downstreams can use the approved local feedback path. Clear child-process credentials, use synthetic HOME/workspace/configuration, bound execution time, and record exact identities. This is not a sandbox for downloaded candidates.

Untrusted candidate code, build scripts, and live verification require an independently reviewed coordinator and disposable isolation. Stage trusted contracts read-only; prevent candidate writes to tests and verdicts; keep tokens, secrets, signing keys, host sockets, and privileged network access out of candidate reach. Bound resources and validate untrusted output.

Separate checkouts do not supply that isolation. Do not create additional working checkouts as a shortcut. A future hosted coordinator must provision its own reviewed ephemeral execution environment; the ordinary operator keeps existing Linux checkouts.

Live integration requires approved non-production targets and synthetic data. Missing configuration, permission, safe execution, or approval is blocked, not skipped-green. Browser traces and live evidence stay private by default and must not upload automatically.

## 14. Hugo reference application: build, deploy, and test the behavior

Use Hugo for a generated static frontend and a .NET API where needed. Host the generated output on a reviewed static hosting service such as Azure Static Web Apps.

The sanitized example is a reading catalogue. It uses synthetic articles rather than company content. The UI displays articles and pagination; an API supplies metadata and enforces authorization.

### Observed delivery shape

The inspected application uses Hugo, Bun-built browser assets, a .NET Function API, an application-owned release adapter, and thin callers to the shared platform. The adapter installs a pinned Hugo version, renders nonsecret runtime configuration, and verifies API behavior and frontend content.

PR qualification runs unit/deployment/acceptance-driver tests, compiles executable C# scenarios and infrastructure, builds browser assets, and runs Hugo. Current configuration enables Dev only. Shared lifecycle support for staging/production must not be presented as evidence that those environments are enabled.

The app's current Hugo/API checks are C# verification, not a complete independent Reqnroll/Gherkin browser suite. The independent acceptance repository is also still scaffolded for live use. The Reqnroll reference below is an explicit reconstruction requirement.

### Required application layout



```text
sample-app/
  repo-architecture.md
  apps/reading/site/
    hugo.toml
    content/
    layouts/
    static/runtime-config.js
    package.json
    bun.lock
  functions/reading/
  tests/
  infra/reading/
    main.bicep
    dev/main.dev.bicepparam
    stg/main.stg.bicepparam
    prd/main.prd.bicepparam
  .github/
    deployment/
    workflows/
      Test-PullRequest.yaml
      Publish-Development.yaml
      Promote-Staging.yaml
      Promote-Production.yaml
      Restore-Production.yaml
```

The layout is proposed and neutral. Keep the application's actual lockfile and compatible tool versions; do not rename a lockfile merely to match the illustration.

### Build and publication sequence

1. Restore locked dependencies with reviewed SDK, Bun, and Hugo versions.

2. Build browser assets, then generate the site.

3. Check expected output, asset references, routes, and runtime-configuration shape.

4. Publish the generated public/ directory, not Hugo source, to the exact approved target.

5. Verify the deployed release identity, real content, runtime configuration, and browser behavior.

6. Record backend and frontend identities separately. Do not infer frontend promotion or rollback from backend artifact movement.

Proposed local build after creating the sample application:



```bash
cd ~/git/sample-app/apps/reading/site
bun install --frozen-lockfile
bun run build
hugo --minify --destination public
```

Browser runtime configuration may contain API URL, tenant/application identifiers, public scopes, and public documentation links. It MUST NOT contain client secrets, deployment tokens, secret-store values, or documentation-publisher credentials.

### Independent Gherkin examples

The following are proposed contracts, not recorded passing tests. Bind every step in the independent suite before claiming execution.



```gherkin
Feature: Read a catalogue through the published website
  Readers can discover articles without exposing publisher credentials.
  @SITE001 @controlled
  Scenario: SITE001 Read the first page of synthetic articles
    Given the approved synthetic catalogue contains 3 articles
    And the exact candidate website uses that catalogue
    When a reader opens the catalogue page
    Then the reader sees 2 article titles on the first page
    And a next-page action is available
    And the browser receives no publisher credential
  @SITE002 @controlled
  Scenario: SITE002 Read the remaining articles
    Given the reader is viewing the first page of that catalogue
    When the reader opens the next page
    Then the remaining article title is visible
    And no article from the first page is repeated
  @SITE003 @integration
  Scenario: SITE003 Deny an unauthenticated API request
    Given the deployed catalogue API requires authentication
    When an unauthenticated client requests the article list
    Then the API responds with HTTP 401
    And the response discloses no article metadata
  @SITE004 @controlled
  Scenario: SITE004 Report a catalogue outage honestly
    Given the catalogue service is unavailable
    When the reader opens the catalogue page
    Then the page displays an actionable unavailable message
    And it does not display a successful empty catalogue
```

Each scenario must establish its own fixture; scenario order is not state. In SITE002, the Given step creates the catalogue and navigates to its first page independently.

Use .NET Playwright for real browser interactions when the claim concerns DOM rendering, navigation, or client behavior. Use HttpClient for direct API contracts. CLI drivers launch the published executable as a process and inspect bounded stdout, stderr, exit code, and declared effects.

For deterministic SITE001/SITE002/SITE004 feedback, the driver may host the actual generated site on loopback and use a controlled catalogue service. That proves frontend behavior against that service, not deployed API identity integration. SITE003 requires the actual API behavior in the approved target; a mock programmed to return 401 cannot prove authentication.

The no-credential assertion must inspect relevant generated assets, configuration, and bounded request/response behavior using synthetic sentinels. Do not copy real secrets into test fixtures or collect unrestricted browser traffic.

### Required website evidence

Check that the approved content appears in generated HTML; scripts and styles return the expected content type; runtime config matches the target; pagination changes visible articles; failed API access does not become an empty-success UI; and release identity matches the exact deployment.

HTTP 200 alone does not establish a working website. Static source-string checks do not establish browser behavior. A backend health check does not establish that the Hugo frontend is current.

## 15. Embedded engineering style guide, version 1.0

Status: normative reconstruction guide synthesized from inspected repository instructions and CLI patterns. The inspected code-conventions repository currently contains a short README, not this full guide. Publishing this page does not install these rules or change that repository.

This section is deliberately self-contained. A future code-conventions/STYLE-GUIDE.md can carry the same versioned content, while consuming repositories reference a reviewed revision and record local exceptions.

### 15.1 Simplicity and maintainability

Choose the simplest complete implementation. Prefer clear control flow, focused functions, and explicit dependencies over cleverness, speculative frameworks, broad configuration surfaces, or premature abstraction.

Reuse existing helpers before introducing new ones. Extract shared behavior only when there is an actual common contract. Do not merge unrelated application semantics into the platform just to reduce file count.

Use meaningful names, shallow nesting, and one responsibility per function or class. Aim for functions that fit on a screen; treat size as a refactoring signal, not a reason to fragment coherent logic into meaningless wrappers.

### 15.2 C# and automation boundaries

Use C#/.NET for orchestration and reusable services, Bicep for Azure declarations, SQL/KQL for queries, TypeScript for browser behavior, and Fish for interactive launchers.

Keep argument parsing, rendering, and exit-code mapping at the command edge. Services return typed results. Put external effects behind focused injectable adapters so decision logic can be tested without cloud access.

Use idiomatic C#: PascalCase types/methods/properties, camelCase locals/parameters, explicit domain types, nullable reference types, async methods with cancellation, and deterministic disposal of owned resources. Use intent-based Get, Find, Test, Set, and Invoke semantics rather than vague Process names.

Do not make C# names imitate shell punctuation. A C# method can be GetReleaseReceiptAsync; its human-facing workflow display name can be Get-ReleaseReceipt.

Avoid unsafe casts, untyped object bags, hidden ambient state, and broad exception swallowing. Catch only errors the boundary can handle meaningfully; otherwise propagate with context.

### 15.3 Input validation and error messages

Validate required configuration before side effects. Name the failed operation, relevant nonsecret target, likely cause, and exact recovery action. Preserve a nonzero failure exit; write diagnostics to stderr when stdout is a machine-readable interface.

Do not convert denied access, parse failure, timeout, malformed response, missing policy, or absent evidence into an empty collection or success-shaped default. Do not log request headers, tokens, private keys, or sensitive payloads.

Retries must be bounded and appropriate to the operation. Honor service backoff, distinguish idempotent reads from writes, and reconcile uncertain writes before repeating them.

### 15.4 Tests and executable specifications

Test behavior, not implementation trivia. Keep inner-loop tests small and deterministic; isolate network/process/time/filesystem effects. Use explicit synthetic fixtures and bounded cleanup.

Acceptance scenarios should be understandable, maintainable, repeatable, atomic, necessary, granular, fast enough for their role, and written first. Include meaningful error and boundary examples, not only happy paths.

Do not let acceptance tests import implementation internals. Do not mock the behavior being asserted. Do not treat skipped tests, zero selected tests, an empty required inventory, successful compilation, or quality scores as proof of acceptance.

Record actual red and green observations against exact revisions. Any change to executable contracts, runner behavior, dependencies, or selection requires renewed independent review.

### 15.5 Infrastructure

Compose reusable modules through a clear stack main.bicep; vary environments through reviewed parameter files. Keep identity, network, monitoring, data lifecycle, and deletion behavior explicit.

Prefer managed identity and OIDC to long-lived credentials. Grant control-plane and data-plane rights separately at the narrowest approved scope. Never store secret values in parameters, outputs, or generated browser assets.

Validate syntax and parameters, review planned changes, and obtain deployment authorization separately. A successful template build is not proof of correct cloud behavior or permission.

### 15.6 Workflows and dependency management

Keep application callers thin and pin platform calls to reviewed full commits. Pin third-party actions immutably in the reconstructed baseline and let dependency PRs propose deliberate updates. This is a target standard; inspected legacy workflows are not uniformly migrated.

Use .yaml for new workflow files, stable distinct check identifiers, Verb-Noun display names, explicit minimal permissions, bounded timeouts, correct concurrency, and actionable failure messages.

Separate unprivileged qualification from privileged deployment. Validate provenance before cloud login. Never execute arbitrary candidate-supplied scripts with deployment credentials.

Keep lockfiles and dependency policies with the code. Review updates through the same gates; do not replace independent approval with a bot label.

### 15.7 Repository instructions and skills

Maintain one clear architecture entrypoint. Reference canonical standards instead of copying a divergent guide into every repository. Keep skills short and task-specific; implement operational behavior in the CLI.

Skills must state authorization boundaries and stop conditions. A prompt instruction is guidance, not an access-control mechanism. Enforce sensitive reviews and cloud access outside the agent.

### 15.8 Documentation and comments

Document decisions, boundaries, commands, prerequisites, failure modes, and verification at the point of use. Keep examples executable or explicitly marked as templates. Distinguish planned capability from observed execution.

Explain non-obvious intent with short comments; do not narrate obvious code. Remove dead code instead of preserving commented-out implementations.

For Confluence, keep versioned Markdown, no duplicate H1, native code blocks, logical headings, and verified publication. Publicly shareable content must exclude company names, private links, business data, identifiers, and operational inventories.

### 15.9 Change and review discipline

Make precise changes in the owning repository. Preserve unrelated work. Use existing tools and run the smallest meaningful validation, expanding scope when results justify it.

Do not weaken tests, required checks, approval rules, or safety boundaries to make a PR green. A documented exception requires an owner, rationale, scope, and review date; it is not permission for silent bypass.

Update directly related architecture and operational documentation when behavior or boundaries change. Report incomplete work and unperformed checks plainly.

### 15.10 Style-guide adoption

To operationalize this embedded guide later, publish its reviewed version in code-conventions, add a stable version/commit reference to each consumer's instructions, and implement focused automated checks for enforceable rules. Keep human review for design and trust judgments.

A reference to a repository containing only a README does not establish a style standard. A guide without adopted checks and review practices is documentation, not enforcement.

## 16. Reconstruction sequence for an AI agent

This is an implementation order, not authorization to create repositories, change GitHub settings, deploy resources, or publish externally. Obtain separate approval for those operations.

| Step | Deliverable | Completion evidence |
| --- | --- | --- |
| 1. Establish ownership | Existing repository inventory, architecture files, dependency map, and neutral naming | Every surface has one owner; no duplicate resource declarations |
| 2. Publish conventions | Versioned guide matching section 15 and consumer references | Reviewed revision and adoption checks |
| 3. Establish local toolchain | Reviewed .NET tool, pinned SDKs/tools, thin Fish launchers | Help and offline tooling checks work in the existing Linux checkout |
| 4. Configure trust | PR app access, protected branches, owner review, required checks, private workflow sharing | Negative enforcement tests and explicit configuration evidence |
| 5. Publish the platform | Reusable workflows and typed release/provenance engine | Reviewed commit, platform tests, documented inputs and recovery contract |
| 6. Build independent harness | Reqnroll execution, public drivers, fixtures, policies, inventory, reporting | Harness self-tests; empty live inventory correctly blocks live claims |
| 7. Agree one sample behavior | One independent executable scenario and exact approval | Reviewed contract revision, safe runner, observed behavioral red |
| 8. Implement the sample | Hugo frontend and .NET API changes plus inner-loop tests | Same contract observes green for the exact local candidate |
| 9. Wire thin application callers | Real immutable platform pin, permissions, triggers, concurrency | Caller contract checks and hosted unprivileged qualification |
| 10. Provision Dev deliberately | Reviewed Bicep stack, identity, target configuration, and telemetry | Planned-change review, authorized deployment, independent cloud observation |
| 11. Demonstrate release | Main publication and exact-candidate verification | Source/artifact/platform/target identities and semantic results |
| 12. Qualify promotion and recovery | Separately approved staging/production setup and retained artifacts | Hosted qualification, protected approval, exact-byte promotion and restore evidence |
| 13. Enable dependency upkeep | Correct manifest coverage and governed update PRs | Real dependency PR exercises required checks without privileged shortcuts |
| 14. Publish operational knowledge | Sanitized architecture, guide, runbook, known limitations | Live page content and native code blocks match the authoring source |

Do not jump from a scaffold to production. Keep live execution disabled until independent contracts, target configuration, approved execution boundaries, and external protections are ready.

### Agent handoff prompt



```text
Reconstruct the engineering system defined by this specification.
First inspect the existing Linux repositories and report their actual state.
Do not create worktrees, duplicate clones, or alternate working checkouts.
Preserve unrelated changes and keep edits in the owning repository.
Use the repository architecture files and the embedded style guide.
Use Copilot skills as thin task guidance and the Projects CLI for operations.
Keep independent acceptance contracts separate from implementation internals.
Start with one human-agreed executable behavior example.
Obtain independent approval of the exact executable contract revision.
Observe a genuine baseline behavioral failure before implementation.
Implement one scenario, verify the same contract against exact candidate bytes,
and record fresh evidence. Do not weaken the contract to obtain green.
Publish and review the shared platform before updating thin caller pins.
Use actual immutable commits, provenance checks, OIDC, protected environments,
required checks, and independent human review. Keep PR authorship separate
from push, merge, acceptance, and cloud-delivery identities.
Treat publication, Git submission, remote writes, settings changes, access
grants, and deployments as separately authorized operations.
Report blockers and distinguish scaffold tests, local feedback,
application-owned checks, independent verification, and human acceptance.
```

## 17. Definition of done for the reconstructed process

| Capability | Required demonstration |
| --- | --- |
| Reproducible architecture | Another engineer can locate owners, commands, dependencies, and approved revisions without private company knowledge |
| Explicit agent authorship | Organization PR is created by the configured app; push/merge credentials remain separate; mismatched author fails safely |
| Governed auto-merge | Failed/missing required checks and unapproved sensitive changes prevent merge; requested does not mean completed |
| Shared workflows | Two reviewed consumers use the same published immutable platform contract without copying the engine |
| Dependency maintenance | Correct ecosystem/directory configuration opens a PR and real gates evaluate it |
| Independent ATDD | A reviewed public-boundary scenario demonstrates behavioral red then green without importing application internals |
| Trustworthy reporting | Zero, missing, skipped, duplicate, stale, unapproved, or wrong-candidate evidence cannot satisfy the decision |
| CLI-first operations | Skills delegate to typed CLI services; help, error paths, JSON, and exit codes match the contract |
| Environment-based IaC | One stack entrypoint and per-environment parameters validate; target/deletion review precedes authorized deployment |
| Hugo delivery | Exact generated site is published; content, assets, configuration, interaction, and release identity are verified |
| Promotion/recovery | Exact retained backend bytes and receipts are used; frontend/data/infrastructure boundaries remain explicit |
| Persistent documentation | Sanitized page is live, code blocks are native, and the embedded guide is complete |

Unperformed demonstrations remain Not run or Blocked. They are not inferred from source inspection, a merged PR, or this document's publication.

## 18. Observed baseline and limitations

The following source families were inspected to assemble this specification. Paths identify generic repository roles, not public links to private implementations.

| Evidence surface | Supported observation | Limitation |
| --- | --- | --- |
| Projects architecture, command help, ATDD guide, and skills | CLI-first operations, typed boundaries, local review/evidence ledger, explicit publication | Local records are attestations, not a trusted acceptance authority |
| Infrastructure architecture, shared-workflow guide, release-engine guide, and workflow sources | Shared contract families, immutable platform binding, artifact provenance, promotion/recovery interfaces | Source does not prove hosted qualification, external permissions, or every caller's migration |
| Local tooling guide and GPR implementation | Commit/push/PR flow, app authorship boundary, auto-merge request, preserved local branches | Broad helper can include unrelated changes; batch completion is not transactionality |
| Independent acceptance architecture and README | Reqnroll scaffold, human approval rules, synthetic local feedback, honest reporter | Live acceptance remains disabled; no authoritative live acceptance service exists |
| Reading application guide, caller, adapter, and acceptance projects | Hugo build, C# API/frontend verification, shared platform use, Dev-only enablement | Independent Reqnroll browser contracts in section 14 are proposed |
| Conventions README and repository guidance | Simplicity, typed CLI boundaries, error handling, workflow/test expectations | The conventions repository does not yet contain the embedded full guide |
| Infrastructure Dependabot configuration | Weekly Actions, Docker, and Terraform update definitions | Not evidence of repository-wide dependency coverage or automatic merging |

No application code, infrastructure, review protection, credential configuration, acceptance authority, or dependency policy is changed by publishing this specification. The immediate deliverable is a sanitized, persistent architecture and implementation contract.

### Public reference pages

[Reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows) — caller and platform mechanics.

[GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) — external merge enforcement.

[Reqnroll documentation](https://docs.reqnroll.net/) — executable Gherkin and .NET bindings.

[Playwright for .NET](https://playwright.dev/dotnet/) — real browser verification.

[Hugo documentation](https://gohugo.io/documentation/) — static site generation.

Tags: agentic-development, atdd, github-actions, dotnet, bicep, infrastructure
