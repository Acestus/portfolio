# Fabric deployment gotchas: schedules, connections, and settings

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- fabric-deployment-gotchas-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-deployment-gotchas/).

Local comparison of sample workspace settings. .NET 11 only. Run one line at a time in fish.

## 1. Capture the source settings

Read the schedule, connection, and parameter values before promotion.

~~~fish
dotnet run --file Demo.cs -- capture-the-source-settings
~~~

## 2. Compare the destination

Show the mapping changes and missing schedule on the destination.

~~~fish
dotnet run --file Demo.cs -- compare-the-destination
~~~

## 3. Gate on required settings

Run the same requirement against incomplete and corrected examples.

~~~fish
dotnet run --file Demo.cs -- gate-on-required-settings
~~~
