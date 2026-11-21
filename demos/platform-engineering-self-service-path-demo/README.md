# Platform engineering demo: a self-service deployment path

[Read the portfolio guide](https://acestus.com/docs/video-platform-engineering-self-service-path/).

Use Python 3 to model a request, validation, and reviewable plan. Run one line at a time in fish.

## 1. Submit the request

Show the only fields the service owner needs to choose.

~~~fish
python3 submit_the_request.py
~~~

## 2. Show a useful validation error

Reject a size outside the allowlist.

~~~fish
python3 show_a_useful_validation_error.py
~~~

## 3. Generate the plan

Add platform defaults to a valid request and point out the review owner.

~~~fish
python3 generate_the_plan.py
~~~
