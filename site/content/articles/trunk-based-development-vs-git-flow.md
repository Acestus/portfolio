---
title: "Trunk-Based Development vs. Git Flow"
date: 2026-11-21
draft: false
tags: ["git", "cicd", "release-engineering"]
summary: "A practical comparison of branching strategies, plus a .NET hotfix demo that keeps trunk history intact."
---

A production hotfix raises two questions. What is actually running, and which changes can ship with the fix? A branching strategy should make both answers easy to find. For a service that can deploy frequently, I prefer trunk-based development with short pull requests and a release record that identifies the deployed artifact.

## How Git Flow works

Git Flow keeps two permanent branches. Completed features merge into `develop`. A release branch stabilizes the next version before it reaches `main`, and urgent fixes branch from `main`. Release and hotfix changes also need to reach the integration line. The branch roles give teams a predictable stabilization process, especially when supporting several versions at once.

Every active branch adds a place where the application can change. If feature, release, and hotfix work accumulate separately, teams have to reconcile them and retest the combined result. The original author, Vincent Driessen, later suggested a simpler workflow for continuous delivery while preserving Git Flow as an option for explicitly versioned software. Atlassian now documents it as a legacy workflow. [Driessen’s branching model](https://nvie.com/posts/a-successful-git-branching-model/) · [Atlassian’s Git Flow guide](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## How trunk-based development works

Keep one shared integration branch, typically `main`, and integrate small changes at least daily. A short pull request can still provide review. Feature flags let incomplete work integrate while keeping it hidden from users. Fast commit checks and shared responsibility for a broken build make frequent integration practical.

DORA describes short branch lifetimes and frequent integration as practices associated with stronger software delivery and operational performance. Those practices shorten the time between introducing an incompatibility and seeing it in the shared build. A branching change still depends on a reliable test suite and work that can be split into small increments. [DORA’s trunk-based development guide](https://dora.dev/capabilities/trunk-based-development/)

| Decision | Git Flow | Trunk-based development |
| --- | --- | --- |
| Where work integrates | `develop`, with releases reaching `main` | One shared `main` |
| When features integrate | Usually when a feature is ready | Small batches throughout the day |
| Where stabilization happens | Dedicated release branch | Continuous checks on trunk |
| What to choose for frequent service deployment | Several release transitions to coordinate | One integration line and explicit deployment records |
| What to choose for independently maintained versions | Dedicated release lines can help | Supported versions can have their own release branches when needed |

## Build once and verify each stage

A commit on `main` identifies the integrated source. A deployment receipt identifies what an environment received: the source SHA, artifact digest, and relevant configuration. Build the candidate once and promote those bytes through development, staging, and production. Verify behavior against each target’s configuration and dependencies before advancing.

```text
Reviewed change → main → build and retain artifact
                         → dev acceptance
                         → staging acceptance
                         → production smoke check and receipt
```

## Hotfix when production is behind trunk

Start with a verified production receipt and check schema and dependency compatibility. A fix on current `main` is usually the shortest route when its other changes can ship. If later application changes must stay out of the incident release, branch briefly from current `main`, restore only the application paths from the deployed version, and apply the fix with a regression check. Review them together in one pull request. The merge adds new history and preserves the earlier commits. Reverting files leaves any database migrations or external side effects in place, so check those separately.

Stage the exact hotfix artifact and run acceptance before promoting it. If another release is targeting the same environment, confirm which artifact is staged before approving production. After the incident, bring forward deferred changes as reviewed commits and verify that they preserve the fix.

The standalone `hotfix-demo` repository uses a synthetic Hello World application and Git snapshots as local deployment targets. The walkthrough starts with two features on dev and the older baseline on stg and prd. It moves production through two hotfix releases, then cherry-picks the two deferred features onto trunk. The final `dotnet test` checks that dev has count 10 and the second hotfix greeting, while prd stays at count 8 on `release-2`. The demo runs from one checkout. Its production tag moves forward and the release tags identify immutable checkpoints.

[Open the fish runbook on GitHub](https://github.com/Acestus/portfolio/blob/main/docs/runbooks/trunk-branching-hotfix.md).
