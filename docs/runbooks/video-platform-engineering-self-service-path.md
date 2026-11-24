# Platform engineering demo: a self-service deployment path

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/platform-engineering-self-service-path-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- platform-engineering-self-service-path-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-platform-engineering-self-service-path/).

Use .NET 11 to model a request, validation, and reviewable plan. Run one line at a time in fish.

## 1. Submit the request

Show the only fields the service owner needs to choose.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/platform-engineering-self-service-path-demo; and dotnet run --file Demo.cs -- submit-the-request'
~~~

## 2. Show a useful validation error

Reject a size outside the allowlist.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/platform-engineering-self-service-path-demo; and dotnet run --file Demo.cs -- show-a-useful-validation-error'
~~~

## 3. Generate the plan

Add platform defaults to a valid request and point out the review owner.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/platform-engineering-self-service-path-demo; and dotnet run --file Demo.cs -- generate-the-plan'
~~~
