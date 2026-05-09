---
description: "Workflow for creating confluence-style article pages for each SPA. Articles explain the interactive demo with technical depth."
applyTo: "resources/public/articles/**/*.html"
---

# Article Page Creation

## Purpose

Each SPA has a companion article page at `/articles/<name>.html`. These are self-contained HTML documents that explain the interactive demo with real technical depth — architecture decisions, patterns used, and how the work maps to production systems.

## Structure

Every article follows this layout:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{Title} — acestus.com</title>
  <style>/* All CSS inline — self-contained */</style>
</head>
<body>
  <h1>{Title}</h1>
  <div class="executive-summary">Purpose and context</div>
  <div class="metrics-row">Key metrics (3–5 cards)</div>
  <div class="flow-diagram">Architecture flow</div>
  <h2>1. Section</h2>
  ...
  <h2>N. Source Code</h2>
  <footer>Document footer with date</footer>
</body>
</html>
```

## Visual Identity

- Font: Segoe UI → Tahoma → Geneva → Verdana → sans-serif
- Body: max-width 1200px, centered, #faf9f8 background, #323130 text
- Primary accent: #0078d4 (Azure blue)
- h1: Blue with 3px solid bottom border
- h2: Blue with 4px solid left border and 15px left padding

## Component Library

Use these CSS classes (from the HTML document style guide):
- `.executive-summary` — light blue bg, 5px blue left border
- `.metric-card` — white card with bottom border accent
- `.flow-diagram` — centered flow with blue rounded pills
- `.code-block` — dark bg (#1e1e1e), monospace, VS Code colors
- `.principle-box` — light gray bg for key principles

## Writing Standards

- Direct and practical — write for a peer engineer
- Specific — real resource names, CLI commands, configuration values
- Structured for scanning — tables, bullet lists, code blocks
- 3–10 documentation links to Microsoft Learn on first mention of services
- No marketing copy or filler phrases

## Self-Contained

Every article HTML file must be completely self-contained:
- All CSS in a single `<style>` block
- No external stylesheets, no JavaScript, no images
- Renders identically as a local file or hosted
