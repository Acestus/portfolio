# A narrow AI assistant for cloud operations

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- narrow-cloud-operations-assistant-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-narrow-cloud-operations-assistant/).

Use .NET 11 to model a read-only status tool with fictional services. Run one line at a time in fish.

## 1. Allow a known service

Read its current status.

~~~fish
cd /tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo; and dotnet run --file Demo.cs -- allow-a-known-service
~~~

## 2. Reject an unknown service

Show the allowlist rejecting an out of scope request.

~~~fish
cd /tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo; and dotnet run --file Demo.cs -- reject-an-unknown-service
~~~

## 3. Record the outcome

Print a structured audit record for the lookup.

~~~fish
cd /tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo; and dotnet run --file Demo.cs -- record-the-outcome
~~~
