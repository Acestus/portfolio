# Fabric deployment gotchas: schedules, connections, and settings

[Read the portfolio guide](https://acestus.com/docs/video-fabric-deployment-gotchas/).

Local comparison of sample workspace settings. Python 3 only. Run one line at a time in fish.

## 1. Capture the source settings

Read the schedule, connection, and parameter values before promotion.

~~~fish
python3 capture_the_source_settings.py
~~~

## 2. Compare the destination

Show the mapping changes and missing schedule on the destination.

~~~fish
python3 compare_the_destination.py
~~~

## 3. Gate on required settings

Run the same requirement against incomplete and corrected examples.

~~~fish
python3 gate_on_required_settings.py
~~~
