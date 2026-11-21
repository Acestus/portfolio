# Azure Policy exemptions with an expiry and owner

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- policy-exemption-expiry-owner-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-policy-exemption-expiry-owner/).

Use .NET 11 to review a fictional policy exception. Run one line at a time in fish.

## 1. Record scope and ownership

Show the owner, reason, and compensating control.

~~~fish
cd /tmp/acestus-video-demos/policy-exemption-expiry-owner-demo; and dotnet run --file Demo.cs -- record-scope-and-ownership
~~~

## 2. Check expiry

Use fixed dates to show a currently valid and then expired exception.

~~~fish
cd /tmp/acestus-video-demos/policy-exemption-expiry-owner-demo; and dotnet run --file Demo.cs -- check-expiry
~~~

## 3. Decide whether to renew

Apply the decision rule to a resolved finding.

~~~fish
cd /tmp/acestus-video-demos/policy-exemption-expiry-owner-demo; and dotnet run --file Demo.cs -- decide-whether-to-renew
~~~
