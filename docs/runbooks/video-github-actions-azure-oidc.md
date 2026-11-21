# GitHub Actions authentication to Azure without stored passwords

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- github-actions-azure-oidc-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-github-actions-azure-oidc/).

Use ripgrep, Azure CLI, and .NET 11. The example workflow is inactive until you configure a demo GitHub environment and Azure federated identity. Its claim example uses a fictional GitHub owner. Run one line at a time in fish.

## 1. Inspect token issuance

Show the workflow permission and token audience.

~~~fish
rg -n 'id-token: write|azure/login@|AzureADTokenExchange' identity-workflow.example.yml
~~~

## 2. Compare federated subjects

Show which sample subject matches the configured environment.

~~~fish
dotnet run --file Demo.cs -- compare-federated-subjects
~~~

## 3. Identify the active principal

Run after approving a login in your demo environment. Show only the principal type.

~~~fish
az account show --query user.type --output tsv
~~~
