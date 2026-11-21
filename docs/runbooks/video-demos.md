# Video demo repositories

Create all 20 independent local Git repos from the portfolio root. Each repo starts on `main` and includes its own README and demo files.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- all
~~~

The command prints each path under `/tmp/acestus-video-demos/`. To keep the repos somewhere else, pass the destination directory as the final argument. To create just one, use the command in that video's runbook.

| Runbook | Website guide |
| --- | --- |
| [1. A practical Microsoft Fabric CI/CD readiness review](video-fabric-cicd-readiness-review.md) | [Guide](https://acestus.com/docs/video-fabric-cicd-readiness-review/) |
| [2. Promoting Fabric changes safely across environments](video-promote-fabric-changes-across-environments.md) | [Guide](https://acestus.com/docs/video-promote-fabric-changes-across-environments/) |
| [3. Scheduling Fabric pipelines with workload identity](video-fabric-pipelines-workload-identity.md) | [Guide](https://acestus.com/docs/video-fabric-pipelines-workload-identity/) |
| [4. A Fabric medallion pipeline from raw data to a useful report](video-fabric-medallion-pipeline.md) | [Guide](https://acestus.com/docs/video-fabric-medallion-pipeline/) |
| [5. Fabric deployment gotchas: schedules, connections, and settings](video-fabric-deployment-gotchas.md) | [Guide](https://acestus.com/docs/video-fabric-deployment-gotchas/) |
| [6. Infrastructure as code with Bicep and GitHub Actions](video-bicep-github-actions-workflow.md) | [Guide](https://acestus.com/docs/video-bicep-github-actions-workflow/) |
| [7. Terraform or Bicep: choosing the right tool for an Azure project](video-terraform-or-bicep.md) | [Guide](https://acestus.com/docs/video-terraform-or-bicep/) |
| [8. Azure Policy that fixes missing tags](video-azure-policy-remediate-tags.md) | [Guide](https://acestus.com/docs/video-azure-policy-remediate-tags/) |
| [9. Azure cost recommendations: investigate before deleting](video-azure-cost-recommendations-investigate.md) | [Guide](https://acestus.com/docs/video-azure-cost-recommendations-investigate/) |
| [10. A secure, repeatable VM patching workflow](video-secure-vm-patching-workflow.md) | [Guide](https://acestus.com/docs/video-secure-vm-patching-workflow/) |
| [11. From Azure logs to a Fabric operations question](video-azure-logs-to-fabric-question.md) | [Guide](https://acestus.com/docs/video-azure-logs-to-fabric-question/) |
| [12. A narrow AI assistant for cloud operations](video-narrow-cloud-operations-assistant.md) | [Guide](https://acestus.com/docs/video-narrow-cloud-operations-assistant/) |
| [13. GitHub Actions authentication to Azure without stored passwords](video-github-actions-azure-oidc.md) | [Guide](https://acestus.com/docs/video-github-actions-azure-oidc/) |
| [14. Automated acceptance tests for a web workflow](video-automated-acceptance-tests-web.md) | [Guide](https://acestus.com/docs/video-automated-acceptance-tests-web/) |
| [15. Azure Key Vault secrets in a Python application](video-key-vault-secrets-python.md) | [Guide](https://acestus.com/docs/video-key-vault-secrets-python/) |
| [16. Azure Policy exemptions with an expiry and owner](video-policy-exemption-expiry-owner.md) | [Guide](https://acestus.com/docs/video-policy-exemption-expiry-owner/) |
| [17. What infrastructure drift detection catches (and misses)](video-infrastructure-drift-detection.md) | [Guide](https://acestus.com/docs/video-infrastructure-drift-detection/) |
| [18. A beginner's GitHub Desktop workflow for infrastructure projects](video-github-desktop-infrastructure.md) | [Guide](https://acestus.com/docs/video-github-desktop-infrastructure/) |
| [19. Configuration management versus rebuilding the image](video-configuration-management-vs-image-rebuild.md) | [Guide](https://acestus.com/docs/video-configuration-management-vs-image-rebuild/) |
| [20. Platform engineering demo: a self-service deployment path](video-platform-engineering-self-service-path.md) | [Guide](https://acestus.com/docs/video-platform-engineering-self-service-path/) |

The [trunk branching hotfix runbook](trunk-branching-hotfix.md) creates its own `hotfix-demo` repo. The [video library](https://acestus.com/videos/) lists published recordings.
