# Hotfix path

Open this file from the root of a fresh `hotfix-demo` checkout on `main`. Run one line at a time in fish. The `./dt` helper runs `dotnet test` on a snapshot of the selected ref.

~~~fish
./dt template-dev; and ./dt template-stg; and ./dt template-prd
git log main -10 --oneline --decorate
~~~

## 1. Prep for hotfix

~~~fish
git restore --source=release-1-ready --staged --worktree -- Hello.cs Feature3.cs Feature4.cs
git commit -m "Hello World hotfix 1"
git tag release-1
git merge-base --is-ancestor prd release-1; and git tag -f prd release-1
./dt template-prd
~~~

Production should show `Hello World hotfix 1` and count 7.

## 2. Apply hotfix

In `Hello.cs`, change the message to `Hello World hotfix 2` and `BaseCount` to 8.

~~~fish
vi Hello.cs
git commit -am "Hello World hotfix 2"
git tag release-2
git merge-base --is-ancestor prd release-2; and git tag -f prd release-2
./dt template-prd
~~~

Production should show `Hello World hotfix 2` and count 8.

## 3. Cherry-pick features 3 and 4

~~~fish
git cherry-pick -x feature-3
git cherry-pick -x feature-4
./dt template-dev
git log --oneline --graph --decorate
~~~

Development should show the second hotfix and count 10. Production stays at count 8 on `release-2`.
