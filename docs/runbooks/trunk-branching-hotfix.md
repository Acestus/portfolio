# Trunk branching hotfix demo

Create a fresh demo from anywhere in the portfolio checkout. Use a new destination directory if you already have a hotfix demo in `/tmp`.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- hotfix-demo /tmp/acestus-hotfix
~~~

Open `/tmp/acestus-hotfix/hotfix-demo/docs/hotfix-path.md` in Neovim. Run the commands from `/tmp/acestus-hotfix/hotfix-demo`.

[The 16-line hotfix path](../../demos/hotfix-demo/docs/hotfix-path.md) · [Trunk-Based Development vs. Git Flow](https://acestus.com/articles/trunk-based-development-vs-git-flow/)
