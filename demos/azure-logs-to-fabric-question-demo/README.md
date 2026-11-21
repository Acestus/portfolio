# From Azure logs to a Fabric operations question

[Read the portfolio guide](https://acestus.com/docs/video-azure-logs-to-fabric-question/).

Use Python 3 and SQLite to model a Fabric query with synthetic telemetry. Run one line at a time in fish.

## 1. Generate sample events

Show two failed order runs and a healthy inventory run.

~~~fish
python3 generate_sample_events.py
~~~

## 2. Query failed runs

Group failures by pipeline.

~~~fish
python3 query_failed_runs.py
~~~

## 3. Measure freshness

Use sample event and refresh times to explain the dashboard lag and retention cost.

~~~fish
python3 measure_freshness.py
~~~
