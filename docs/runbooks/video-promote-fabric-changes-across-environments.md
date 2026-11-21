# Promoting Fabric changes safely across environments

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- promote-fabric-changes-across-environments-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-promote-fabric-changes-across-environments/).

Local release evidence exercise. .NET 11 only. Run one line at a time in fish.

## 1. Identify the candidate

Hash one sample definition package and point out the digest used for promotion.

~~~fish
cd /tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo; and dotnet run --file Demo.cs -- identify-the-candidate
~~~

## 2. Carry the same digest

Compare the candidate identity recorded at the three sample stages.

~~~fish
cd /tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo; and dotnet run --file Demo.cs -- carry-the-same-digest
~~~

## 3. Reject stale evidence

Demonstrate why a receipt from an older attempt blocks promotion.

~~~fish
cd /tmp/acestus-video-demos/promote-fabric-changes-across-environments-demo; and dotnet run --file Demo.cs -- reject-stale-evidence
~~~
