# Fabric deployment gotchas: schedules, connections, and settings

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/fabric-deployment-gotchas-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- fabric-deployment-gotchas-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-deployment-gotchas/).

Local comparison of sample workspace settings. .NET 11 only. Run one line at a time in fish.

## 1. Capture the source settings

Read the schedule, connection, and parameter values before promotion.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/fabric-deployment-gotchas-demo; and dotnet run --file Demo.cs -- capture-the-source-settings'
~~~

## 2. Compare the destination

Show the mapping changes and missing schedule on the destination.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/fabric-deployment-gotchas-demo; and dotnet run --file Demo.cs -- compare-the-destination'
~~~

## 3. Gate on required settings

Run the same requirement against incomplete and corrected examples.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/fabric-deployment-gotchas-demo; and dotnet run --file Demo.cs -- gate-on-required-settings'
~~~
