# Terraform or Bicep: choosing the right tool for an Azure project

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- terraform-or-bicep-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-terraform-or-bicep/).

Use Azure CLI with Bicep installed, Terraform, and .NET 11. Both templates describe a private Azure storage account. The local commands compile or validate the definitions. Run one line at a time in fish.

## 1. Compile the Bicep side

Build the sample storage template to show what gets submitted to Azure.

~~~fish
cd /tmp/acestus-video-demos/terraform-or-bicep-demo; and az bicep build --file main.bicep --stdout
~~~

## 2. Validate an equivalent Terraform definition

Install the declared provider and validate the storage definition. A live plan requires Azure access and demo resource values.

~~~fish
cd /tmp/acestus-video-demos/terraform-or-bicep-demo; and terraform init -backend=false; and terraform validate
~~~

## 3. Decide which workflow fits

Use the same sample Azure project to compare scope, state ownership, and review tools.

~~~fish
cd /tmp/acestus-video-demos/terraform-or-bicep-demo; and dotnet run --file Demo.cs -- compare-workflows
~~~
