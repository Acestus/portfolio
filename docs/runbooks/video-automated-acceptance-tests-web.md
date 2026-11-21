# Automated acceptance tests for a web workflow

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- automated-acceptance-tests-web-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-automated-acceptance-tests-web/).

Use .NET 11. From the demo repo, install the Playwright browser once. Run one line at a time in fish.

~~~fish
dotnet run --file SearchDemo.cs -- install
~~~

## 1. Show the browser action

Point out the search interaction and expected results region.

~~~fish
rg -n 'GetByRole|ToHaveTextAsync' SearchDemo.cs
~~~

## 2. Run the browser check

Run the focused Playwright test against the demo HTML. To record a failure, change the matching result string in search.html and rerun.

~~~fish
dotnet run --file SearchDemo.cs
~~~

## 3. Trace it into CI

Find the browser install and acceptance commands in CI.

~~~fish
rg -n 'setup-dotnet|dotnet run' .github/workflows/acceptance.yml
~~~
