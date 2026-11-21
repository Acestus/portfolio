# Scheduling Fabric pipelines with workload identity

[Read the portfolio guide](https://acestus.com/docs/video-fabric-pipelines-workload-identity/).

Local trigger and monitoring exercise. .NET 11 only. Run one line at a time in fish.

## 1. Show the scheduled input

Walk through a daily schedule and the bounded input it passes.

~~~fish
dotnet run --file Demo.cs -- show-the-scheduled-input
~~~

## 2. Explain token expiry

Compare the same illustrative token metadata before and after expiry.

~~~fish
dotnet run --file Demo.cs -- explain-token-expiry
~~~

## 3. Follow the run receipt

Use a sample run ID to link an accepted request to a later status.

~~~fish
dotnet run --file Demo.cs -- follow-the-run-receipt
~~~
