# From Azure logs to a Fabric operations question

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- azure-logs-to-fabric-question-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-logs-to-fabric-question/).

Use .NET 11 to model a Fabric query with synthetic telemetry. Run one line at a time in fish.

## 1. Generate sample events

Show two failed order runs and a healthy inventory run.

~~~fish
dotnet run --file Demo.cs -- generate-sample-events
~~~

## 2. Query failed runs

Group the synthetic CSV failures by pipeline.

~~~fish
dotnet run --file Demo.cs -- query-failed-runs
~~~

## 3. Measure freshness

Use sample event and refresh times to explain the dashboard lag and retention cost.

~~~fish
dotnet run --file Demo.cs -- measure-freshness
~~~
