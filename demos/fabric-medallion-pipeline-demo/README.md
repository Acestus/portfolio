# A Fabric medallion pipeline from raw data to a useful report

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
