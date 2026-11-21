# A secure, repeatable VM patching workflow

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- secure-vm-patching-workflow-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-secure-vm-patching-workflow/).

Local maintenance review using a fictional fleet. .NET 11 only. Run one line at a time in fish.

## 1. Review patch scope

Show the machines selected for a maintenance window.

~~~fish
dotnet run --file Demo.cs -- review-patch-scope
~~~

## 2. Apply a named exception

Show which VM is deferred and display its owner and expiry.

~~~fish
dotnet run --file Demo.cs -- apply-a-named-exception
~~~

## 3. Verify guest results

Treat failed and unreported guests as follow-up work.

~~~fish
dotnet run --file Demo.cs -- verify-guest-results
~~~
