# A practical Microsoft Fabric CI/CD readiness review

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- fabric-cicd-readiness-review-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-cicd-readiness-review/).

Local Fabric review worksheet. .NET 11 only. Run one line at a time in fish.

## 1. Inventory Git coverage

Compare the workspace inventory with the definitions in Git.

~~~fish
dotnet run --file Demo.cs -- inventory-git-coverage
~~~

## 2. Check a deployment receipt

Compare the reviewed commit with the commit listed on the sample receipt.

~~~fish
dotnet run --file Demo.cs -- check-a-deployment-receipt
~~~

## 3. Assign operational follow-up

Record the missing schedule, connection, and secret checks with owners.

~~~fish
dotnet run --file Demo.cs -- assign-operational-follow-up
~~~
