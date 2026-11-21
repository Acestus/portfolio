# A secure, repeatable VM patching workflow

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- secure-vm-patching-workflow-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-secure-vm-patching-workflow/).

Local maintenance review using a fictional fleet. .NET 11 only. Run one line at a time in fish.

## 1. Review patch scope

Show the machines selected for a maintenance window.

~~~fish
cd /tmp/acestus-video-demos/secure-vm-patching-workflow-demo; and dotnet run --file Demo.cs -- review-patch-scope
~~~

## 2. Apply a named exception

Show which VM is deferred and display its owner and expiry.

~~~fish
cd /tmp/acestus-video-demos/secure-vm-patching-workflow-demo; and dotnet run --file Demo.cs -- apply-a-named-exception
~~~

## 3. Verify guest results

Treat failed and unreported guests as follow-up work.

~~~fish
cd /tmp/acestus-video-demos/secure-vm-patching-workflow-demo; and dotnet run --file Demo.cs -- verify-guest-results
~~~
