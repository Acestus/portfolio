# What infrastructure drift detection catches (and misses)

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- infrastructure-drift-detection-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-infrastructure-drift-detection/).

Compare sample declared and observed properties with .NET 11. Run one line at a time in fish.

## 1. Display desired state

Record the desired owner before making a manual change.

~~~fish
cd /tmp/acestus-video-demos/infrastructure-drift-detection-demo; and dotnet run --file Demo.cs -- display-desired-state
~~~

## 2. Detect the drift

Show the difference in the observed owner.

~~~fish
cd /tmp/acestus-video-demos/infrastructure-drift-detection-demo; and dotnet run --file Demo.cs -- detect-the-drift
~~~

## 3. Reconcile tracked properties

Show that matching the owner says nothing about runtime data.

~~~fish
cd /tmp/acestus-video-demos/infrastructure-drift-detection-demo; and dotnet run --file Demo.cs -- reconcile-tracked-properties
~~~
