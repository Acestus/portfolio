# Infrastructure as code with Bicep and GitHub Actions

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/bicep-github-actions-workflow-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- bicep-github-actions-workflow-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-bicep-github-actions-workflow/).

Use Azure CLI with its Bicep CLI installed, .NET 11, and ripgrep. Publish this demo repo to GitHub and push a change to run its validation workflow. The identity example shows how deployment authentication would be wired. Run one line at a time in fish.

## 1. Compile the Bicep template

Show the compiled resource types from the existing portfolio template.

~~~fish
az bicep build --file /tmp/acestus-video-demos/bicep-github-actions-workflow-demo/main.bicep --stdout
~~~

## 2. Inspect the federated deploy job

Show the token permission, protected environment, and Azure login in the example workflow.

~~~fish
rg -n 'id-token: write|azure/login@|AzureADTokenExchange' /tmp/acestus-video-demos/bicep-github-actions-workflow-demo/identity-workflow.example.yml
~~~

## 3. Inspect push and PR validation

Review the source commit and conclusion of the demo workflow run.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/bicep-github-actions-workflow-demo; and gh run list --workflow validate.yml --limit 5 --json headSha,conclusion,url'
~~~
