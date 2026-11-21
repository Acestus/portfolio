---
name: fish-runbooks
description: Create and update Acestus portfolio runbooks with standalone, one-line fish commands and visible acceptance results.
---

# Fish runbooks

Use this skill when creating or editing operational runbooks for the Acestus portfolio, especially commands intended to run one line at a time in Neovim's terminal mapping.

## Command rules

- Put one complete, executable command on each physical line in a fish code fence.
- Make every line independent. Do not set or reference shell variables, environment variables, aliases, or state created by an earlier line. Put literal URLs and values directly in the command.
- Avoid line continuations and multi-line shell snippets. Fish command substitution such as (gh run list ...) is allowed when the same line is independently executable.
- For acceptance checks, use curl -fsSL with an inline Python one-liner; validate a non-empty response, absence of the known (eval):5: parse error near text, and the topic-specific evidence the runbook claims to check. Use Python's standard library to strip HTML tags and unescape text when checking rendered docs.
- Print an explicit PASS: or FAIL: result in the same command so the terminal visibly reports the outcome.
- Do not ask the reader to rely on assumed external state between commands.

## Video guide runbooks

Base key points on the corresponding published guide under site/content/docs/video-*.md. Use three concise, distinct points that reflect the guide's goal, demonstration, and an important verification or guardrail. Include a live curl acceptance check for that guide URL that validates those points. Keep commands aligned with the current release workflow and preserve the one-line-at-a-time fish format.