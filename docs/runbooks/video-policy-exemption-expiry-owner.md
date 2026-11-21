# Azure Policy exemptions with an expiry and owner

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py policy-exemption-expiry-owner-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-policy-exemption-expiry-owner/).

Use Python 3 to review a fictional policy exception. Run one line at a time in fish.

## 1. Record scope and ownership

Show the owner, reason, and compensating control.

~~~fish
python3 record_scope_and_ownership.py
~~~

## 2. Check expiry

Use fixed dates to show a currently valid and then expired exception.

~~~fish
python3 check_expiry.py
~~~

## 3. Decide whether to renew

Apply the decision rule to a resolved finding.

~~~fish
python3 decide_whether_to_renew.py
~~~
