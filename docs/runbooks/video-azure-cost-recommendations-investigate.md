# Azure cost recommendations: investigate before deleting

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- azure-cost-recommendations-investigate-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-cost-recommendations-investigate/).

Local recommendation review using fictional costs and resources. .NET 11 only. Run one line at a time in fish.

## 1. Read the signal

Compute average CPU from the narrow sample window.

~~~fish
cd /tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo; and dotnet run --file Demo.cs -- read-the-signal
~~~

## 2. Look for dependencies

Reveal a backup job that changes the decision despite low mean CPU.

~~~fish
cd /tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo; and dotnet run --file Demo.cs -- look-for-dependencies
~~~

## 3. Compare against a baseline

Estimate the observed change from two equal sample cost windows.

~~~fish
cd /tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo; and dotnet run --file Demo.cs -- compare-against-a-baseline
~~~
