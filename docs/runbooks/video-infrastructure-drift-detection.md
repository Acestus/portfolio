# What infrastructure drift detection catches (and misses)

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/infrastructure-drift-detection-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- infrastructure-drift-detection-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-infrastructure-drift-detection/).

Compare sample declared and observed properties with .NET 11. Run one line at a time in fish.

## 1. Display desired state

Record the desired owner before making a manual change.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/infrastructure-drift-detection-demo; and dotnet run --file Demo.cs -- display-desired-state'
~~~

## 2. Detect the drift

Show the difference in the observed owner.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/infrastructure-drift-detection-demo; and dotnet run --file Demo.cs -- detect-the-drift'
~~~

## 3. Reconcile tracked properties

Show that matching the owner says nothing about runtime data.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/infrastructure-drift-detection-demo; and dotnet run --file Demo.cs -- reconcile-tracked-properties'
~~~
