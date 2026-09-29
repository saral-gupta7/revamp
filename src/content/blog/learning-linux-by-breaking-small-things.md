---
title: "Learning Linux by breaking small things"
description: "A practical learning loop for understanding systems without turning the main machine into a crime scene."
pubDate: 2026-09-24
tags:
  - Linux
  - Cybersecurity
  - Learning
readingTime: "3 min read"
draft: false
---

Reading about Linux is useful. Repairing a Linux system after confidently changing the wrong file is memorable.

I have been learning Linux and cybersecurity through small, disposable environments: virtual machines, containers, deliberately vulnerable services, and networks that can be rebuilt without an apology.

## Make the environment disposable

The safest place to experiment is one you can destroy. A snapshot turns a risky change into a question instead of a crisis.

Before changing anything, I write down three things:

- What I expect to happen
- How I will observe the result
- How I will return to the previous state

That small habit makes experiments repeatable and exposes vague assumptions before they become mysterious failures.

## Follow the evidence

When something breaks, the goal is not to immediately search for a command that fixes it. The goal is to understand which layer failed.

Is the process running? Is the port open? Does the route exist? Can the user read the file? What do the logs say happened immediately before the failure?

Tools such as `systemctl`, `journalctl`, `ss`, `ip`, and `strace` become much easier to remember when each one answers a question you actually have.

## Security is systems understanding

Cybersecurity stops feeling like a separate discipline when viewed this way. Permissions, process boundaries, network exposure, secrets, and update policies are all properties of the system.

The better I understand how a machine is intended to behave, the easier it becomes to notice behaviour that does not belong.

For now, the loop is simple: isolate, predict, change, observe, recover, and write down what surprised me.
