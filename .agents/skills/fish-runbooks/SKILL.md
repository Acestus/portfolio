---
name: fish-runbooks
description: Write Acestus demo runbooks with self-contained fish commands, one command per physical line.
---

# Fish runbooks

Write each line so it runs in a fresh fish process from Neovim. Use literal paths, URLs, and values. Avoid shell variables, aliases, and line continuations. Document the working directory, prerequisites, and any files or Git state made by an earlier step.

For a video runbook, use the matching portfolio guide to choose three concrete steps. Show the actual operation and its observable result. Use a labeled local fixture when the article needs a service that has not been set up. For acceptance checks, report a visible result and preserve failure status. Include website checks or deployment commands when the demonstration needs them.

Use `dotnet run --file <name>.cs` for C# demo commands and `dotnet test` for .NET acceptance checkpoints. Pass application arguments after `--`.

If setup lives at the repository root, resolve the root in the same fish line so Neovim can launch it from a nested directory.

When a portfolio runbook launches a command in a separate demo repository, put the literal demo path and `cd` on that same line. Preserve the demo working directory for commands that read fixtures or change Git state.
