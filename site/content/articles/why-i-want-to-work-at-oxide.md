---
title: "Why I Want to Work at Oxide"
date: 2026-11-21T09:00:00-06:00
draft: false
unlisted: true
tags: ["engineering", "infrastructure", "oxide"]
summary: "How my experience in cloud infrastructure, support, and history connects with the work I want to contribute to at Oxide."
---

I have spent much of my career helping organizations move infrastructure into the cloud. That experience is part of what makes me interested in Oxide.

The practices I value most—infrastructure as code, automated delivery, observability, version control, and repeatable operations—should be useful wherever a system runs. Moving into a cloud provider’s environment creates an opportunity to adopt those practices, but the principles themselves do not belong to a provider. I want to help build infrastructure that brings those capabilities to the place where an organization needs to operate.

Oxide’s ambition to design hardware and software together speaks to that interest. I like understanding how the pieces of a system connect, what assumptions they make about each other, and what happens when those assumptions fail. The opportunity to work on an integrated system, all the way down to a physical rack, is compelling to me. There is something satisfying about being able to walk over to a machine and say, “I helped make that work.”

## Learning to understand the whole system

I came to engineering with training as a historian. That background still shapes how I work.

Historians learn to examine sources: who created them, what purpose they served, what biases they contain, and which conclusions the evidence supports. Those questions are useful when reading technical documentation, evaluating an architectural recommendation, or investigating an outage.

During one repository migration from Bitbucket to GitHub, I introduced a configuration error that overwrote current production configuration with an older version. A website went down after Argo CD deployed the change.

Finding the cause required following the evidence through monitoring records, deployment logs, Git history, and the migration configuration. I restored the affected files and corrected the repository mapping. I also had to acknowledge that the automation had carried out my mistake.

That kind of investigation matters to me. I want to understand why a system behaved as it did and use that understanding to improve how we operate it.

## Making operations understandable

A recurring theme in my work has been turning operational knowledge into something a whole team can inspect and use.

I have worked in environments where important procedures depended on someone remembering which settings to change in a web interface. Those procedures can keep a business running, but they become difficult to review, reproduce, and teach.

I enjoy working with the people who understand those systems, documenting the intent of their procedures, and translating that knowledge into code. A repository, a pull request, and an automated deployment give the team a shared record of what changed and why.

In a current engagement with a loan company, I am helping connect application modernization, Azure infrastructure, CI/CD, and data processing. The technologies include .NET Azure Functions, Static Web Apps, Bicep, and a medallion data architecture. My responsibility is to help those parts become a system the organization can understand and operate.

That is the kind of contribution I would like to bring to Oxide: connecting technical domains, making operations visible, and following a problem through to a useful result.

## Supporting the people who depend on the system

Support work appeals to me because the outcome is concrete. Someone needs to accomplish something, and infrastructure is either helping them or getting in their way.

In one engagement, I helped a customer retire its data center. Its domain controllers supported identity, application authentication, policy, and DNS. We had to work through those responsibilities individually before the customer could safely shut them down.

I brought Azure knowledge; the customer’s engineer brought knowledge of the existing environment. We needed both. After approximately six months, the customer could close the data center while continuing normal operations.

I would welcome a role at Oxide where that combination of investigation, collaboration, and ownership helps colleagues and customers succeed. I like being trusted with a problem, learning what I need to learn, and staying involved until the result works for the people depending on it.

## Work worth contributing to

I first became interested in Oxide through the podcast. I appreciated hearing engineers discuss difficult problems in depth, including the reasoning and disagreements behind their decisions.

The explicit attention to curiosity, rigor, transparency, and responsibility also resonates with me. Those are qualities I want to practice: continue learning, examine the evidence, make knowledge available, and take ownership of outcomes.

Responsibility has a personal dimension for me, too. I have three sons and three daughters. I care about doing meaningful work and about being present for my family. I value an understanding of professionalism that takes both commitments seriously.

As a historian, I am interested in why organizations choose to build differently and what those choices make possible. As an engineer, I want to contribute to the work itself.

At Oxide, I see an opportunity to bring my experience in Linux, automation, infrastructure, migration, and support to a difficult and tangible engineering effort. I want to help build systems people can understand, operate, and trust—and keep growing alongside the people building them.
