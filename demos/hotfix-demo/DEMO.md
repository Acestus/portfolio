# Hotfix demo

Run the [hotfix path](docs/hotfix-path.md) with Git, fish, and the .NET 11 SDK. `./dt` uses the current `main` commit for dev and the `stg` and `prd` tags for the other two simulated environments.

To record another take, create a new checkout with the original demo history. The destination must be a new directory.

~~~fish
./reset-demo /tmp/hotfix-demo-take2
~~~
