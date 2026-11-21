# A Fabric medallion pipeline from raw data to a useful report

[Read the portfolio guide](https://acestus.com/docs/video-fabric-medallion-pipeline/).

Local medallion pipeline with synthetic CSV, using Python 3. Run one line at a time in fish.

## 1. Land Bronze rows

Show the original source fields and an ingestion stamp.

~~~fish
python3 land_bronze_rows.py
~~~

## 2. Validate Silver rows

Convert valid amounts to numbers and quarantine the empty amount.

~~~fish
python3 validate_silver_rows.py
~~~

## 3. Reconcile Gold totals

Compute and check the report total against the known fixture.

~~~fish
python3 reconcile_gold_totals.py
~~~
