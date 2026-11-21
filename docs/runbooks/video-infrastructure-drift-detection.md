# What infrastructure drift detection catches (and misses)

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py infrastructure-drift-detection-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-infrastructure-drift-detection/).

Compare sample declared and observed properties with Python 3. Run one line at a time in fish.

## 1. Display desired state

Record the desired owner before making a manual change.

~~~fish
python3 display_desired_state.py
~~~

## 2. Detect the drift

Show the difference in the observed owner.

~~~fish
python3 detect_the_drift.py
~~~

## 3. Reconcile tracked properties

Show that matching the owner says nothing about runtime data.

~~~fish
python3 reconcile_tracked_properties.py
~~~
