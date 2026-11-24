# GitHub Actions authentication to Azure without stored passwords

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/github-actions-azure-oidc-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- github-actions-azure-oidc-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-github-actions-azure-oidc/).

Use ripgrep, Azure CLI, and .NET 11. The example workflow is inactive until you configure a demo GitHub environment and Azure federated identity. Its claim example uses a fictional GitHub owner. Run one line at a time in fish.

## 1. Inspect token issuance

Show the workflow permission and token audience.

~~~fish
rg -n 'id-token: write|azure/login@|AzureADTokenExchange' /tmp/acestus-video-demos/github-actions-azure-oidc-demo/identity-workflow.example.yml
~~~

## 2. Compare federated subjects

Show which sample subject matches the configured environment.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/github-actions-azure-oidc-demo; and dotnet run --file Demo.cs -- compare-federated-subjects'
~~~

## 3. Identify the active principal

Run after approving a login in your demo environment. Show only the principal type.

~~~fish
az account show --query user.type --output tsv
~~~
