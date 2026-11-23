---
title: ".NET Storage Naming Lab"
description: "Check Azure storage account names with a file-based C# program."
space: "Architecture & delivery"
legacyArticle: "/articles/clojure-repl.html"
demo: "/repl.html"
---

Storage account names join the CAF components without separators. Azure accepts 3–24 lowercase ASCII letters or digits, and the name must be globally unique. This lab checks the syntax locally. Availability is a separate Azure check. [Azure resource naming rules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules)

Download [StorageNaming.cs](/downloads/StorageNaming.cs) and run a command from its download directory with the .NET 10 SDK or later.

~~~fish
dotnet run --file StorageNaming.cs -- stprojectdevscus001
dotnet run --file StorageNaming.cs -- st-project-dev-scus-001
~~~

The first command prints PASS and exits with status 0. The second prints FAIL and exits with status 1. You can pass several names in one command. The program reports each name and exits with status 1 if any name fails.

[Open the lab](/repl.html) · [CAF Naming Puzzle](/matcher.html) · [IaC Pipeline guide](/docs/iac-pipeline/)
