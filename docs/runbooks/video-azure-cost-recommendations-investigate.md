# Azure cost recommendations: investigate before deleting

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- azure-cost-recommendations-investigate-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-cost-recommendations-investigate/).

Local recommendation review using fictional costs and resources. .NET 11 only. Run one line at a time in fish.

## 1. Read the signal

Compute average CPU from the narrow sample window.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo; and dotnet run --file Demo.cs -- read-the-signal'
~~~

## 2. Look for dependencies

Reveal a backup job that changes the decision despite low mean CPU.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo; and dotnet run --file Demo.cs -- look-for-dependencies'
~~~

## 3. Compare against a baseline

Estimate the observed change from two equal sample cost windows.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-cost-recommendations-investigate-demo; and dotnet run --file Demo.cs -- compare-against-a-baseline'
~~~
