# A narrow AI assistant for cloud operations

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- narrow-cloud-operations-assistant-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-narrow-cloud-operations-assistant/).

Use .NET 11 to model a read-only status tool with fictional services. Run one line at a time in fish.

## 1. Allow a known service

Read its current status.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo; and dotnet run --file Demo.cs -- allow-a-known-service'
~~~

## 2. Reject an unknown service

Show the allowlist rejecting an out of scope request.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo; and dotnet run --file Demo.cs -- reject-an-unknown-service'
~~~

## 3. Record the outcome

Print a structured audit record for the lookup.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/narrow-cloud-operations-assistant-demo; and dotnet run --file Demo.cs -- record-the-outcome'
~~~
