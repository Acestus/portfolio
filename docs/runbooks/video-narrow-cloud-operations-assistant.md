# A narrow AI assistant for cloud operations

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py narrow-cloud-operations-assistant-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-narrow-cloud-operations-assistant/).

Use Python 3 to model a read-only status tool with fictional services. Run one line at a time in fish.

## 1. Allow a known service

Read its current status.

~~~fish
python3 allow_a_known_service.py
~~~

## 2. Reject an unknown service

Show the allowlist rejecting an out of scope request.

~~~fish
python3 reject_an_unknown_service.py
~~~

## 3. Record the outcome

Print a structured audit record for the lookup.

~~~fish
python3 record_the_outcome.py
~~~
