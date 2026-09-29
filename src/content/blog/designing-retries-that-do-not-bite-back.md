---
title: "Designing retries that do not bite back"
description: "A field note on idempotency, backoff, and why retrying failed work is a product decision too."
pubDate: 2026-09-17
tags:
  - Distributed Systems
  - Reliability
  - Go
readingTime: "4 min read"
draft: false
---

Retries look harmless in a diagram: an operation fails, so the system tries again. In production, that innocent arrow can duplicate payments, amplify an outage, or keep broken work alive long after anyone wanted it.

The important question is not simply whether an operation can be retried. It is whether repeating it produces a result the system can understand.

## Make repetition safe

An idempotency key gives multiple attempts one identity. The first successful attempt records its result; later attempts return that result instead of performing the side effect again.

This is especially useful at boundaries where the caller cannot tell whether a timeout means “nothing happened” or “it happened, but the response was lost.” Without an identity for the operation, both sides are guessing.

## Back off with some randomness

Immediate retries turn one failure into a crowd. If a dependency is already struggling, thousands of clients repeating the same request at the same interval can prevent it from recovering.

Exponential backoff creates breathing room. Jitter prevents every worker from waking up together. Neither solves the original failure, but both keep the recovery mechanism from becoming a second incident.

## Decide when to stop

Some failures are temporary. Others are instructions.

A network timeout may deserve another attempt. Invalid input does not. A retry policy should classify failures, cap the total attempts, and move exhausted work somewhere visible.

Dead-letter queues are not graveyards. They are debugging interfaces. A useful one preserves the payload, the failure history, and enough context to answer why the work never completed.

The best retry system is deliberately boring: safe to repeat, patient under pressure, and honest when it cannot make progress.
