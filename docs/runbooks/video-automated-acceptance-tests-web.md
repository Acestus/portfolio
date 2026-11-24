# Automated acceptance tests for a web workflow

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/automated-acceptance-tests-web-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- automated-acceptance-tests-web-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-automated-acceptance-tests-web/).

Use .NET 11. Install the Playwright browser once. Run one line at a time in fish.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/automated-acceptance-tests-web-demo; and dotnet run --file SearchDemo.cs -- install'
~~~

## 1. Show the browser action

Point out the search interaction and expected results region.

~~~fish
rg -n 'GetByRole|ToHaveTextAsync' /tmp/acestus-video-demos/automated-acceptance-tests-web-demo/SearchDemo.cs
~~~

## 2. Run the browser check

Run the focused Playwright test against the demo HTML. To record a failure, change the matching result string in `/tmp/acestus-video-demos/automated-acceptance-tests-web-demo/search.html` and rerun.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/automated-acceptance-tests-web-demo; and dotnet run --file SearchDemo.cs'
~~~

## 3. Trace it into CI

Find the browser install and acceptance commands in CI.

~~~fish
rg -n 'setup-dotnet|dotnet run' /tmp/acestus-video-demos/automated-acceptance-tests-web-demo/.github/workflows/acceptance.yml
~~~
