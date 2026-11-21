# A narrow AI assistant for cloud operations

[Read the portfolio guide](https://acestus.com/docs/video-narrow-cloud-operations-assistant/).

Use .NET 11 to model a read-only status tool with fictional services. Run one line at a time in fish.

## 1. Allow a known service

Read its current status.

~~~fish
dotnet run --file Demo.cs -- allow-a-known-service
~~~

## 2. Reject an unknown service

Show the allowlist rejecting an out of scope request.

~~~fish
dotnet run --file Demo.cs -- reject-an-unknown-service
~~~

## 3. Record the outcome

Print a structured audit record for the lookup.

~~~fish
dotnet run --file Demo.cs -- record-the-outcome
~~~
