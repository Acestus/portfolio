# Azure Policy that fixes missing tags

From anywhere in the portfolio checkout, create the demo repo under `/tmp/acestus-video-demos/`. Skip setup if the repo already exists. Each demo command enters its repo before running. If you used a custom destination, run the commands in that repo’s README from its root.

~~~fish
cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- azure-policy-remediate-tags-demo
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-policy-remediate-tags/).

Local model of a modify policy and remediation task. .NET 11 only. Run one line at a time in fish.

## 1. Find the missing tag

Start with a sample resource whose tags omit the required owner.

~~~fish
cd /tmp/acestus-video-demos/azure-policy-remediate-tags-demo; and dotnet run --file Demo.cs -- find-the-missing-tag
~~~

## 2. Preview remediation

Apply the sample change to a copy to show exactly what the task would write.

~~~fish
cd /tmp/acestus-video-demos/azure-policy-remediate-tags-demo; and dotnet run --file Demo.cs -- preview-remediation
~~~

## 3. Recheck compliance

Show that presence and correctness are separate checks.

~~~fish
cd /tmp/acestus-video-demos/azure-policy-remediate-tags-demo; and dotnet run --file Demo.cs -- recheck-compliance
~~~
