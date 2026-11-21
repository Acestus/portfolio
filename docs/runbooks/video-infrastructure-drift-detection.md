# What infrastructure drift detection catches (and misses)

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- infrastructure-drift-detection-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-infrastructure-drift-detection/).

Compare sample declared and observed properties with .NET 11. Run one line at a time in fish.

## 1. Display desired state

Record the desired owner before making a manual change.

~~~fish
dotnet run --file Demo.cs -- display-desired-state
~~~

## 2. Detect the drift

Show the difference in the observed owner.

~~~fish
dotnet run --file Demo.cs -- detect-the-drift
~~~

## 3. Reconcile tracked properties

Show that matching the owner says nothing about runtime data.

~~~fish
dotnet run --file Demo.cs -- reconcile-tracked-properties
~~~
