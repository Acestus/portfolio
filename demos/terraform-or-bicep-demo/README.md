# Terraform or Bicep: choosing the right tool for an Azure project

[Read the portfolio guide](https://acestus.com/docs/video-terraform-or-bicep/).

Use Azure CLI with Bicep installed, Terraform, and .NET 11. Both templates describe a private Azure storage account. The local commands compile or validate the definitions. Run one line at a time in fish.

## 1. Compile the Bicep side

Build the sample storage template to show what gets submitted to Azure.

~~~fish
az bicep build --file main.bicep --stdout
~~~

## 2. Validate an equivalent Terraform definition

Install the declared provider and validate the storage definition. A live plan requires Azure access and demo resource values.

~~~fish
terraform init -backend=false; and terraform validate
~~~

## 3. Decide which workflow fits

Use the same sample Azure project to compare scope, state ownership, and review tools.

~~~fish
dotnet run --file Demo.cs -- compare-workflows
~~~
