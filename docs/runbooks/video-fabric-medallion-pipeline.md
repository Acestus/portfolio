# A Fabric medallion pipeline from raw data to a useful report

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- fabric-medallion-pipeline-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-medallion-pipeline/).

Local medallion pipeline with synthetic CSV, using .NET 11. Run one line at a time in fish.

## 1. Land Bronze rows

Show the original source fields and an ingestion stamp.

~~~fish
dotnet run --file Demo.cs -- land-bronze-rows
~~~

## 2. Validate Silver rows

Convert valid amounts to numbers and quarantine the empty amount.

~~~fish
dotnet run --file Demo.cs -- validate-silver-rows
~~~

## 3. Reconcile Gold totals

Compute and check the report total against the known fixture.

~~~fish
dotnet run --file Demo.cs -- reconcile-gold-totals
~~~
