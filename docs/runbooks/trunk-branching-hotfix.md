# Trunk branching hotfix demo

Run one line at a time in fish from the portfolio root. The setup command creates a brand-new local Git repository at `/tmp/hotfix-demo` and requires Git, Python 3, and the .NET 11 SDK. The first `dotnet test` restores the xUnit packages. Each filter selects the acceptance case for that checkpoint. The local worktrees simulate the three environments. The production marker moves only after the corresponding test passes in staging.

[Read Trunk-Based Development vs. Git Flow](https://acestus.com/articles/trunk-based-development-vs-git-flow/).

## 1. Start from the production baseline

Dev starts with features 3 and 4 and a count of 8. Staging and production start at release-0 with a count of 6. Restore only the application files on a short-lived branch. Commit the first fix, then move the local production marker forward to the new release. The original commits and release-0 remain in history.

~~~fish
python3 scripts/seed_hotfix_demo.py /tmp/hotfix-demo
git -C /tmp/hotfix-demo log main -10 --oneline --decorate
dotnet test /tmp/hotfix-demo/.stages/dev/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.BeforeHotfixDevelopment --logger 'console;verbosity=normal'
dotnet test /tmp/hotfix-demo/.stages/stg/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.Baseline --logger 'console;verbosity=normal'
dotnet test /tmp/hotfix-demo/.stages/prd/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.Baseline --logger 'console;verbosity=normal'
git -C /tmp/hotfix-demo switch -c hotfix/hello main
git -C /tmp/hotfix-demo restore --source=release-0 --staged --worktree -- Hello.cs Feature3.cs Feature4.cs
printf '%s\n' 'public static class Hello { public static string Message { get; } = "Hello World hotfix 1"; public const int BaseCount = 7; }' > /tmp/hotfix-demo/Hello.cs
dotnet test /tmp/hotfix-demo/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.FirstHotfix --logger 'console;verbosity=normal'
git -C /tmp/hotfix-demo add Hello.cs; and git -C /tmp/hotfix-demo commit -m 'Restore production app state and apply hotfix 1'
git -C /tmp/hotfix-demo switch main; and git -C /tmp/hotfix-demo merge --ff-only hotfix/hello
git -C /tmp/hotfix-demo tag release-1 main
git -C /tmp/hotfix-demo merge-base --is-ancestor stg release-1; and git -C /tmp/hotfix-demo tag -f stg release-1
git -C /tmp/hotfix-demo/.stages/stg switch --detach stg; and dotnet test /tmp/hotfix-demo/.stages/stg/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.FirstHotfix --logger 'console;verbosity=normal'
git -C /tmp/hotfix-demo merge-base --is-ancestor prd release-1; and git -C /tmp/hotfix-demo tag -f prd release-1
git -C /tmp/hotfix-demo/.stages/prd switch --detach prd; and dotnet test /tmp/hotfix-demo/.stages/prd/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.FirstHotfix --logger 'console;verbosity=normal'
~~~

## 2. Apply hotfix 2

First run the new acceptance case against hotfix 1 and show the expected failure. Then change the greeting and base count, run the same case again, and verify the release in staging and production.

~~~fish
git -C /tmp/hotfix-demo switch -c hotfix/hello-2 main
dotnet test /tmp/hotfix-demo/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.SecondHotfix --logger 'console;verbosity=normal'
printf '%s\n' 'public static class Hello { public static string Message { get; } = "Hello World hotfix 2"; public const int BaseCount = 8; }' > /tmp/hotfix-demo/Hello.cs
dotnet test /tmp/hotfix-demo/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.SecondHotfix --logger 'console;verbosity=normal'
git -C /tmp/hotfix-demo commit -am 'Apply Hello World hotfix 2'
git -C /tmp/hotfix-demo switch main; and git -C /tmp/hotfix-demo merge --ff-only hotfix/hello-2
git -C /tmp/hotfix-demo tag release-2 main
git -C /tmp/hotfix-demo merge-base --is-ancestor stg release-2; and git -C /tmp/hotfix-demo tag -f stg release-2
git -C /tmp/hotfix-demo/.stages/stg switch --detach stg; and dotnet test /tmp/hotfix-demo/.stages/stg/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.SecondHotfix --logger 'console;verbosity=normal'
git -C /tmp/hotfix-demo merge-base --is-ancestor prd release-2; and git -C /tmp/hotfix-demo tag -f prd release-2
git -C /tmp/hotfix-demo/.stages/prd switch --detach prd; and dotnet test /tmp/hotfix-demo/.stages/prd/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.SecondHotfix --logger 'console;verbosity=normal'
~~~

## 3. Reapply features 3 and 4

Cherry-pick the original feature commits in order. Each touches its own file, so a conflict would be a reason to stop and inspect. Run development acceptance for count 10 and verify production still serves the release-2 greeting with count 8.

~~~fish
git -C /tmp/hotfix-demo cherry-pick -x feature-3
git -C /tmp/hotfix-demo cherry-pick -x feature-4
git -C /tmp/hotfix-demo merge-base --is-ancestor dev main; and git -C /tmp/hotfix-demo tag -f dev main
git -C /tmp/hotfix-demo/.stages/dev switch --detach dev; and dotnet test /tmp/hotfix-demo/.stages/dev/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.FeaturesRestored --logger 'console;verbosity=normal'
dotnet test /tmp/hotfix-demo/.stages/prd/HotfixDemo.csproj --filter FullyQualifiedName=Acceptance.SecondHotfix --logger 'console;verbosity=normal'
git -C /tmp/hotfix-demo log main --oneline --graph --decorate
~~~
