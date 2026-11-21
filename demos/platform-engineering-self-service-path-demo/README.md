# Platform engineering demo: a self-service deployment path

[Read the portfolio guide](https://acestus.com/docs/video-platform-engineering-self-service-path/).

Use .NET 11 to model a request, validation, and reviewable plan. Run one line at a time in fish.

## 1. Submit the request

Show the only fields the service owner needs to choose.

~~~fish
dotnet run --file Demo.cs -- submit-the-request
~~~

## 2. Show a useful validation error

Reject a size outside the allowlist.

~~~fish
dotnet run --file Demo.cs -- show-a-useful-validation-error
~~~

## 3. Generate the plan

Add platform defaults to a valid request and point out the review owner.

~~~fish
dotnet run --file Demo.cs -- generate-the-plan
~~~
