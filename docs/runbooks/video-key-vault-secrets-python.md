# Azure Key Vault secrets in a Python application

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py key-vault-secrets-python-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-key-vault-secrets-python/).

Use Python 3 and a mock vault with a dummy value. Run one line at a time in fish.

## 1. Show the role boundary

Compare a demo identity with secret read permission against an anonymous identity.

~~~fish
python3 show_the_role_boundary.py
~~~

## 2. Verify allowed read

Compare the dummy result without printing it.

~~~fish
python3 verify_allowed_read.py
~~~

## 3. Verify denied read

Show the unauthorized identity receives no value.

~~~fish
python3 verify_denied_read.py
~~~
