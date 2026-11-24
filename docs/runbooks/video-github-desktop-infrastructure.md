# A beginner's GitHub Desktop workflow for infrastructure projects

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/github-desktop-infrastructure-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- github-desktop-infrastructure-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-github-desktop-infrastructure/).

Open the seeded repo in GitHub Desktop. Publish it to a demo GitHub account before creating a PR. Create the branch and commit in that same checkout so the commands below can find them.

## 1. Clone and branch in Desktop

In GitHub Desktop, create a branch called `demo/infrastructure-note` in the seeded repo.

~~~fish
git -C /tmp/acestus-video-demos/github-desktop-infrastructure-demo branch --show-current
~~~

## 2. Edit and commit in Desktop

Edit the tag in infrastructure.md, review Changes, and commit it. Show the commit and diff.

~~~fish
git -C /tmp/acestus-video-demos/github-desktop-infrastructure-demo show --stat --patch HEAD
~~~

## 3. Publish and review in Desktop

Publish the branch and open the PR in GitHub. Review its files and checks with GitHub CLI.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/github-desktop-infrastructure-demo; and gh pr view --json url,files,statusCheckRollup'
~~~
