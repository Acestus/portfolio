# A beginner's GitHub Desktop workflow for infrastructure projects

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
python3 scripts/seed_video_demo.py github-desktop-infrastructure-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-github-desktop-infrastructure/).

Open this newly created local repo in GitHub Desktop. Publish it to a demo GitHub account before creating a PR. Run the Git lines from the clone root. Run one line at a time in fish.

## 1. Clone and branch in Desktop

Open the demo repository in GitHub Desktop or clone its published copy, then create a branch called demo/infrastructure-note.

~~~fish
git branch --show-current
~~~

## 2. Edit and commit in Desktop

Edit the tag in infrastructure.md, review Changes, and commit it. Show the commit and diff.

~~~fish
git show --stat --patch HEAD
~~~

## 3. Publish and review in Desktop

Publish the branch and open the PR in GitHub. Review its files and checks with GitHub CLI.

~~~fish
gh pr view --json url,files,statusCheckRollup
~~~
