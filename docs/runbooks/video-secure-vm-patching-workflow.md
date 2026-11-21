# A secure, repeatable VM patching workflow

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py secure-vm-patching-workflow-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-secure-vm-patching-workflow/).

Local maintenance review using a fictional fleet. Python 3 only. Run one line at a time in fish.

## 1. Review patch scope

Show the machines selected for a maintenance window.

~~~fish
python3 review_patch_scope.py
~~~

## 2. Apply a named exception

Show which VM is deferred and display its owner and expiry.

~~~fish
python3 apply_a_named_exception.py
~~~

## 3. Verify guest results

Treat failed and unreported guests as follow-up work.

~~~fish
python3 verify_guest_results.py
~~~
