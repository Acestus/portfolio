# Scheduling Fabric pipelines with workload identity

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- fabric-pipelines-workload-identity-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-pipelines-workload-identity/).

Local trigger and monitoring exercise. .NET 11 only. Run one line at a time in fish.

## 1. Show the scheduled input

Walk through a daily schedule and the bounded input it passes.

~~~fish
cd /tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo; and dotnet run --file Demo.cs -- show-the-scheduled-input
~~~

## 2. Explain token expiry

Compare the same illustrative token metadata before and after expiry.

~~~fish
cd /tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo; and dotnet run --file Demo.cs -- explain-token-expiry
~~~

## 3. Follow the run receipt

Use a sample run ID to link an accepted request to a later status.

~~~fish
cd /tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo; and dotnet run --file Demo.cs -- follow-the-run-receipt
~~~
