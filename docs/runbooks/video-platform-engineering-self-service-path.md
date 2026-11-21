# Platform engineering demo: a self-service deployment path

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- platform-engineering-self-service-path-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-platform-engineering-self-service-path/).

Use .NET 11 to model a request, validation, and reviewable plan. Run one line at a time in fish.

## 1. Submit the request

Show the only fields the service owner needs to choose.

~~~fish
cd /tmp/acestus-video-demos/platform-engineering-self-service-path-demo; and dotnet run --file Demo.cs -- submit-the-request
~~~

## 2. Show a useful validation error

Reject a size outside the allowlist.

~~~fish
cd /tmp/acestus-video-demos/platform-engineering-self-service-path-demo; and dotnet run --file Demo.cs -- show-a-useful-validation-error
~~~

## 3. Generate the plan

Add platform defaults to a valid request and point out the review owner.

~~~fish
cd /tmp/acestus-video-demos/platform-engineering-self-service-path-demo; and dotnet run --file Demo.cs -- generate-the-plan
~~~
