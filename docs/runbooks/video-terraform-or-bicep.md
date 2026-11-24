# Terraform or Bicep: choosing the right tool for an Azure project

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/terraform-or-bicep-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- terraform-or-bicep-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-terraform-or-bicep/).

Use Azure CLI with Bicep installed, Terraform, and .NET 11. Both templates describe a private Azure storage account. The local commands compile or validate the definitions. Run one line at a time in fish.

## 1. Compile the Bicep side

Build the sample storage template to show what gets submitted to Azure.

~~~fish
az bicep build --file /tmp/acestus-video-demos/terraform-or-bicep-demo/main.bicep --stdout
~~~

## 2. Validate an equivalent Terraform definition

Install the declared provider and validate the storage definition. A live plan requires Azure access and demo resource values.

~~~fish
terraform -chdir=/tmp/acestus-video-demos/terraform-or-bicep-demo init -backend=false && terraform -chdir=/tmp/acestus-video-demos/terraform-or-bicep-demo validate
~~~

## 3. Decide which workflow fits

Use the same sample Azure project to compare scope, state ownership, and review tools.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/terraform-or-bicep-demo; and dotnet run --file Demo.cs -- compare-workflows'
~~~
