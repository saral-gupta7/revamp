---
title: "Boring technology is a feature, not a failure"
description: "Why good engineering starts with constraints, not a shopping list of fashionable tools."
pubDate: 2026-09-30
tags:
  - Engineering
  - Systems
  - Decisions
readingTime: "4 min read"
draft: false
---

There is a particular kind of excitement that comes from starting a new project. Everything is possible, including the completely unnecessary database migration you will regret in six months.

The temptation is to begin with tools: which language, framework, database, queue, deployment platform, and observability stack should we use? Those decisions matter, but they are not the starting point.

## Start with the shape of the problem

A useful stack is a response to constraints. How much traffic do we expect? What does failure look like? Who will maintain this? How quickly do we need to learn whether the idea is valuable?

For a small product, a single process and PostgreSQL may be the sophisticated choice. For a distributed queue, leases and retry semantics matter more than the logo on the runtime. The most impressive architecture is often the one with the fewest moving parts that still handles reality.

## Familiarity has compounding returns

Boring technology is not technology without ambition. It is technology whose failure modes are understood.

Familiar tools give a team better instincts. Logs mean something. Operational surprises are easier to classify. Documentation exists because somebody else already made the mistake at 3 a.m.

That does not mean never learning anything new. It means new technology should earn its place by removing a real constraint, not by making the architecture diagram more interesting.

## Stay loyal to fundamentals

Languages and frameworks change. The useful questions travel well:

- Is the system observable?
- Can it fail safely?
- Is the data model honest about the domain?
- Can another person understand it without a guided tour?
- Does the complexity buy something the user can feel?

I work across TypeScript, Go, PostgreSQL, Python, Java, and Rust. The list will change. The habit I want to keep is choosing deliberately.

Good engineering is less about having a favourite hammer and more about noticing when the problem is not a nail.
