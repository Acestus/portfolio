(eval):5: parse error near `end'
(eval):5: parse error near `end'
# Future Video Ideas

A ranked backlog of videos that would support the Acestus portfolio and its practical cloud systems focus. Rankings favor alignment with the site's current Fabric CI/CD service and published work on cloud delivery, infrastructure as code, operational AI, and engineering workflows.

The source catalog contains internal recordings. The ideas below are rewritten as public-facing topics: use synthetic examples, public demo resources, and generic names. Do not show customer data, private tenant details, credentials, internal URLs, or identifying work artifacts. Confirm that product behavior and screenshots are current before recording.

## Priority 1: Strongest fit

1. **A practical Microsoft Fabric CI/CD readiness review** — Walk through Git integration, deployment automation, schedule handling, and secret management using a sample workspace. Connects directly to the site's Fabric CI/CD review service.
2. **Promoting Fabric changes safely across environments** — Show a source-controlled change moving through development, staging, and production, with checks and evidence at each step. Builds on the site's Fabric CI/CD architecture article.
3. **Scheduling Fabric pipelines with workload identity** — Demonstrate a scheduled pipeline trigger through an API and OIDC-based authentication, explaining the tradeoffs and current platform options.
4. **A Fabric medallion pipeline from raw data to a useful report** — Build a small Bronze/Silver/Gold example and explain ingestion, transformation, and validation. Use generated data and keep the scope approachable.
5. **Fabric deployment gotchas: what happens to schedules, connections, and settings?** — Demonstrate common environment-promotion gaps and a repeatable checklist for finding them.

## Priority 2: High fit

6. **Infrastructure as code with Bicep and GitHub Actions** — Build a small Azure resource set, validate it in a pull request, and deploy with federated identity. Emphasize a complete, understandable workflow.
7. **Terraform or Bicep: choosing the right tool for an Azure project** — Compare a modest example across authoring, state, modules, testing, and team workflow. Keep recommendations specific rather than declaring a universal winner.
8. **Azure Policy that fixes missing tags** — Show a policy detecting and remediating missing metadata in a disposable demo subscription, including what compliance status does and does not prove.
9. **Azure cost recommendations: investigate before deleting** — Demonstrate how to verify a recommendation using utilization, ownership, and dependencies before proposing a change. Use fictional resources and cost figures.
10. **A secure, repeatable VM patching workflow** — Explain how to assess patch coverage and automate a maintenance cycle, including exceptions and verification.
11. **From Azure logs to a Fabric operations question** — Trace a small synthetic telemetry example into Fabric and demonstrate a focused query or dashboard. Be clear about the components and costs involved.
12. **A narrow AI assistant for cloud operations** — Show an assistant that can perform one bounded task through a constrained tool, with explicit validation and a human-readable audit trail.

## Priority 3: Useful supporting topics

13. **GitHub Actions authentication to Azure without stored passwords** — Explain OIDC federation, least privilege, and how to verify which identity a workflow uses.
14. **Automated acceptance tests for a web workflow** — Show a local Playwright feedback loop with a sample application and explain which checks belong in CI.
15. **Azure Key Vault secrets in a Python application** — Demonstrate managed identity or workload identity access and safe local development practices using dummy secrets.
16. **Azure Policy exemptions with an expiry and owner** — Show how to document a temporary exception and review it later using a sample scenario.
17. **What infrastructure drift detection catches (and misses)** — Make a controlled configuration change, detect drift, and restore the declared state. Explain the limits of drift reporting.
18. **A beginner's GitHub Desktop workflow for infrastructure projects** — Clone, edit, commit, and open a pull request using a harmless sample repository.
19. **Configuration management versus rebuilding the image** — Compare the two approaches for a small server configuration change and discuss repeatability and operational overhead.
20. **Platform engineering demo: a self-service deployment path** — Illustrate a simple paved road from a request to a validated deployment, with guardrails visible to the developer.

## Suggested recording order

Start with ideas 1–5 as a short Fabric series. They reinforce the site's clearest service offering and can share one sanitized demo workspace. Follow with ideas 6–10 to broaden the channel into practical cloud delivery and governance. Use ideas 11–20 when there is a concrete public demo and a clear takeaway.

## Source material and editorial notes

The pasted Loom catalog is a source of possible demonstrations, not a publication checklist. Some recordings describe internal environments, work in progress, or one-off experiments. Before adapting any recording, rebuild the walkthrough in a clean demo environment, remove internal identifiers and proprietary details, and verify current product behavior. Prefer a fresh recording when the original depends on private context or outdated interfaces.
