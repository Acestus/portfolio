# Infrastructure as code with Bicep and GitHub Actions

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- bicep-github-actions-workflow-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-bicep-github-actions-workflow/).

Use Azure CLI with its Bicep CLI installed, .NET 11, and ripgrep. Publish this demo repo to GitHub and push a change to run its validation workflow. The identity example shows how deployment authentication would be wired. Run one line at a time in fish.

## 1. Compile the Bicep template

Show the compiled resource types from the existing portfolio template.

~~~fish
cd /tmp/acestus-video-demos/bicep-github-actions-workflow-demo; and az bicep build --file main.bicep --stdout
~~~

## 2. Inspect the federated deploy job

Show the token permission, protected environment, and Azure login in the example workflow.

~~~fish
cd /tmp/acestus-video-demos/bicep-github-actions-workflow-demo; and rg -n 'id-token: write|azure/login@|AzureADTokenExchange' identity-workflow.example.yml
~~~

## 3. Inspect push and PR validation

Review the source commit and conclusion of the demo workflow run.

~~~fish
cd /tmp/acestus-video-demos/bicep-github-actions-workflow-demo; and gh run list --workflow validate.yml --limit 5 --json headSha,conclusion,url
~~~
