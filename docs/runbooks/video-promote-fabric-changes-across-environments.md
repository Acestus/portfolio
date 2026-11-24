# Promoting Fabric changes safely across environments

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- promote-fabric-changes-across-environments-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-promote-fabric-changes-across-environments/).

Local release evidence exercise. .NET 11 only. Run one line at a time in fish.

## 1. Identify the candidate

Hash one sample definition package and point out the digest used for promotion.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo; and dotnet run --file Demo.cs -- identify-the-candidate'
~~~

## 2. Carry the same digest

Compare the candidate identity recorded at the three sample stages.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo; and dotnet run --file Demo.cs -- carry-the-same-digest'
~~~

## 3. Reject stale evidence

Demonstrate why a receipt from an older attempt blocks promotion.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo; and dotnet run --file Demo.cs -- reject-stale-evidence'
~~~
