# From Azure logs to a Fabric operations question

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/azure-logs-to-fabric-question-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- azure-logs-to-fabric-question-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-logs-to-fabric-question/).

Use .NET 11 to model a Fabric query with synthetic telemetry. Run one line at a time in fish.

## 1. Generate sample events

Show two failed order runs and a healthy inventory run.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-logs-to-fabric-question-demo; and dotnet run --file Demo.cs -- generate-sample-events'
~~~

## 2. Query failed runs

Group the synthetic CSV failures by pipeline.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-logs-to-fabric-question-demo; and dotnet run --file Demo.cs -- query-failed-runs'
~~~

## 3. Measure freshness

Use sample event and refresh times to explain the dashboard lag and retention cost.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-logs-to-fabric-question-demo; and dotnet run --file Demo.cs -- measure-freshness'
~~~
