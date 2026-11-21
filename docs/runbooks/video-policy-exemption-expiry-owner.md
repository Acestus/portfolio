# Azure Policy exemptions with an expiry and owner

From the portfolio root, create the demo repo under `/tmp/acestus-video-demos/`. Run the remaining commands from the new repo, or open its README in Neovim.

~~~fish
dotnet run --file scripts/SeedDemo.cs -- policy-exemption-expiry-owner-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-policy-exemption-expiry-owner/).

Use .NET 11 to review a fictional policy exception. Run one line at a time in fish.

## 1. Record scope and ownership

Show the owner, reason, and compensating control.

~~~fish
dotnet run --file Demo.cs -- record-scope-and-ownership
~~~

## 2. Check expiry

Use fixed dates to show a currently valid and then expired exception.

~~~fish
dotnet run --file Demo.cs -- check-expiry
~~~

## 3. Decide whether to renew

Apply the decision rule to a resolved finding.

~~~fish
dotnet run --file Demo.cs -- decide-whether-to-renew
~~~
