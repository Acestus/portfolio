# Scheduling Fabric pipelines with workload identity

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- fabric-pipelines-workload-identity-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-pipelines-workload-identity/).

Local trigger and monitoring exercise. .NET 11 only. Run one line at a time in fish.

## 1. Show the scheduled input

Walk through a daily schedule and the bounded input it passes.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo; and dotnet run --file Demo.cs -- show-the-scheduled-input'
~~~

## 2. Explain token expiry

Compare the same illustrative token metadata before and after expiry.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo; and dotnet run --file Demo.cs -- explain-token-expiry'
~~~

## 3. Follow the run receipt

Use a sample run ID to link an accepted request to a later status.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/fabric-pipelines-workload-identity-demo; and dotnet run --file Demo.cs -- follow-the-run-receipt'
~~~
