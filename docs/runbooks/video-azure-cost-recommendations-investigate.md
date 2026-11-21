# Azure cost recommendations: investigate before deleting

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py azure-cost-recommendations-investigate-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-cost-recommendations-investigate/).

Local recommendation review using fictional costs and resources. Python 3 only. Run one line at a time in fish.

## 1. Read the signal

Compute average CPU from the narrow sample window.

~~~fish
python3 read_the_signal.py
~~~

## 2. Look for dependencies

Reveal a backup job that changes the decision despite low mean CPU.

~~~fish
python3 look_for_dependencies.py
~~~

## 3. Compare against a baseline

Estimate the observed change from two equal sample cost windows.

~~~fish
python3 compare_against_a_baseline.py
~~~
