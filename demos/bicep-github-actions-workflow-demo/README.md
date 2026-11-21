# Infrastructure as code with Bicep and GitHub Actions

[Read the portfolio guide](https://acestus.com/docs/video-bicep-github-actions-workflow/).

Use Azure CLI with its Bicep CLI installed, .NET 11, and ripgrep. Publish this demo repo to GitHub and push a change to run its validation workflow. The identity example shows how deployment authentication would be wired. Run one line at a time in fish.

## 1. Compile the Bicep template

Show the compiled resource types from the existing portfolio template.

~~~fish
az bicep build --file main.bicep --stdout
~~~

## 2. Inspect the federated deploy job

Show the token permission, protected environment, and Azure login in the example workflow.

~~~fish
rg -n 'id-token: write|azure/login@|AzureADTokenExchange' identity-workflow.example.yml
~~~

## 3. Inspect push and PR validation

Review the source commit and conclusion of the demo workflow run.

~~~fish
gh run list --workflow validate.yml --limit 5 --json headSha,conclusion,url
~~~
