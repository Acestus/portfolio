# Scheduling Fabric pipelines with workload identity

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py fabric-pipelines-workload-identity-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-fabric-pipelines-workload-identity/).

Local trigger and monitoring exercise. Python 3 only. Run one line at a time in fish.

## 1. Show the scheduled input

Walk through a daily schedule and the bounded input it passes.

~~~fish
python3 show_the_scheduled_input.py
~~~

## 2. Explain token expiry

Compare the same illustrative token metadata before and after expiry.

~~~fish
python3 explain_token_expiry.py
~~~

## 3. Follow the run receipt

Use a sample run ID to link an accepted request to a later status.

~~~fish
python3 follow_the_run_receipt.py
~~~
