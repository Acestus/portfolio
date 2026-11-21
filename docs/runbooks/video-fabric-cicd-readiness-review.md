# A practical Microsoft Fabric CI/CD readiness review

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- fabric-cicd-readiness-review-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-cicd-readiness-review/).

Local Fabric review worksheet. .NET 11 only. Run one line at a time in fish.

## 1. Inventory Git coverage

Compare the workspace inventory with the definitions in Git.

~~~fish
cd /tmp/acestus-video-demos/fabric-cicd-readiness-review-demo; and dotnet run --file Demo.cs -- inventory-git-coverage
~~~

## 2. Check a deployment receipt

Compare the reviewed commit with the commit listed on the sample receipt.

~~~fish
cd /tmp/acestus-video-demos/fabric-cicd-readiness-review-demo; and dotnet run --file Demo.cs -- check-a-deployment-receipt
~~~

## 3. Assign operational follow-up

Record the missing schedule, connection, and secret checks with owners.

~~~fish
cd /tmp/acestus-video-demos/fabric-cicd-readiness-review-demo; and dotnet run --file Demo.cs -- assign-operational-follow-up
~~~
