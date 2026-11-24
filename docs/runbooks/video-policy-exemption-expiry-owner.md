# Azure Policy exemptions with an expiry and owner

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/policy-exemption-expiry-owner-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- policy-exemption-expiry-owner-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-policy-exemption-expiry-owner/).

Use .NET 11 to review a fictional policy exception. Run one line at a time in fish.

## 1. Record scope and ownership

Show the owner, reason, and compensating control.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/policy-exemption-expiry-owner-demo; and dotnet run --file Demo.cs -- record-scope-and-ownership'
~~~

## 2. Check expiry

Use fixed dates to show a currently valid and then expired exception.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/policy-exemption-expiry-owner-demo; and dotnet run --file Demo.cs -- check-expiry'
~~~

## 3. Decide whether to renew

Apply the decision rule to a resolved finding.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/policy-exemption-expiry-owner-demo; and dotnet run --file Demo.cs -- decide-whether-to-renew'
~~~
