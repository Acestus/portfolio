# Azure Policy that fixes missing tags

Run each line from `docs/runbooks/` in Neovim, Bash, or fish. Run setup once to create the demo at `/tmp/acestus-video-demos/azure-policy-remediate-tags-demo`. If it already exists, start with the next command.

~~~fish
fish -c 'cd -- "$(git rev-parse --show-toplevel)"; and dotnet run --file scripts/SeedDemo.cs -- azure-policy-remediate-tags-demo'
~~~


[Read the portfolio guide](https://acestus.com/docs/video-azure-policy-remediate-tags/).

Local model of a modify policy and remediation task. .NET 11 only. Run one line at a time in fish.

## 1. Find the missing tag

Start with a sample resource whose tags omit the required owner.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-policy-remediate-tags-demo; and dotnet run --file Demo.cs -- find-the-missing-tag'
~~~

## 2. Preview remediation

Apply the sample change to a copy to show exactly what the task would write.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-policy-remediate-tags-demo; and dotnet run --file Demo.cs -- preview-remediation'
~~~

## 3. Recheck compliance

Show that presence and correctness are separate checks.

~~~fish
fish -c 'cd -- /tmp/acestus-video-demos/azure-policy-remediate-tags-demo; and dotnet run --file Demo.cs -- recheck-compliance'
~~~
