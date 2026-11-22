# Fabric deployment gotchas: schedules, connections, and settings

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- fabric-deployment-gotchas-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-deployment-gotchas/).

Local comparison of sample workspace settings. .NET 11 only. Run one line at a time in fish.

## 1. Capture the source settings

Read the schedule, connection, and parameter values before promotion.

~~~fish
cd /tmp/acestus-video-demos/fabric-deployment-gotchas-demo; and dotnet run --file Demo.cs -- capture-the-source-settings
~~~

## 2. Compare the destination

Show the mapping changes and missing schedule on the destination.

~~~fish
cd /tmp/acestus-video-demos/fabric-deployment-gotchas-demo; and dotnet run --file Demo.cs -- compare-the-destination
~~~

## 3. Gate on required settings

Run the same requirement against incomplete and corrected examples.

~~~fish
cd /tmp/acestus-video-demos/fabric-deployment-gotchas-demo; and dotnet run --file Demo.cs -- gate-on-required-settings
~~~
