---
title: "My Current OpenClaw Setup: Practical Local AI Agents with Private Routing"
date: 2026-06-08T15:49:18Z
draft: false
tags: ["openclaw", "ai-agents", "automation", "field-report"]
summary: "A field report on running two OpenClaw instances — a Raspberry Pi business agent and a Mac mini personal assistant with private iMessage routing."
---

I've been experimenting heavily with OpenClaw, and I wanted to write up my current setup for other IT professionals who may be curious about what is possible with it today.

The short version: OpenClaw is powerful, but it is still very much in the "foot gun" stage.

If you are comfortable with Markdown, Git, scripting, cron jobs, basic Linux administration, API keys, and troubleshooting services, you can probably catch up to where I am in about 40 hours of focused tinkering.

If you are not already doing IT work, systems administration, or software development, the onboarding curve is going to be much steeper. This is not yet a polished consumer product. It is closer to a flexible agent framework for people who are comfortable wiring systems together.

That said, the potential is enormous.

Right now I have two OpenClaw instances running.

## Instance 1: Raspberry Pi business agent

The first instance runs on a Raspberry Pi.

This agent has a small business-like workflow. Once a day, it checks whether it has enough money available to cover its cloud subscription costs. It can look at markets for things it might sell, generate small static websites, and experiment with Google Ads to direct traffic to those sites.

At the moment, it makes about $50 a month.

That is not life-changing money, obviously, but the interesting part is not the amount. The interesting part is that the agent operates with a defined business context and a limited set of tools.

I gave it access to:

- Its own Stripe account
- Its own email address
- Its own phone number
- Web search through a Brave API key
- The ability to generate simple static sites
- Some scripted workflows around checking costs and opportunities

The goal is not to create a fully autonomous company overnight. The goal is to explore what happens when an AI agent has a persistent identity, a constrained budget, a few business tools, and recurring tasks.

It is less about "AI replaces a business owner" and more about "AI can become a lightweight operator for a very narrow business process."

## Instance 2: Mac mini personal assistant

The second instance runs on a Mac mini.

The main reason I bought the Mac mini was simple: AppleScript.

That's it.

I wanted an OpenClaw agent that could interact with Apple services in a private, local way. The Mac mini is not exposed to the public internet. It is basically sitting there waiting for me to text it through iMessage.

When I send it an iMessage, it reads the message, processes it through a local OpenClaw prompt, and replies back to me.

This means I can interact with the agent naturally from my phone without opening up a public endpoint or building a custom chat interface. It only needs access to Apple's services, not the open internet.

This agent has access to:

- iMessage
- AppleScript
- Its own email address
- Apple Notes, if I share notes with it
- A shared calendar
- Web search through Brave API
- Local Markdown files and scripts
- Cron-based recurring tasks

The private routing is the important part.

The Mac mini does not need to be open to the internet. I do not need to expose a web server. I do not need to punch holes in my firewall. I can text the assistant through iMessage, and the Mac handles the rest locally.

That is a very compelling architecture for a personal assistant.

## Why this matters

A lot of AI assistant demos are flashy but shallow. They show an agent answering questions in a browser or calling one API.

What I am more interested in is persistent, tool-using agents that can live inside real workflows.

For example:

- Checking accounts or subscriptions on a schedule
- Reading and writing Markdown notes
- Managing reminders or calendar events
- Running local scripts
