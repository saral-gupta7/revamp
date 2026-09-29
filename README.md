# Saral Gupta | Portfolio

A static Astro portfolio built with Tailwind CSS, local fonts, and Astro content collections.

## Commands

```sh
pnpm install
pnpm build
pnpm astro dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

## Add a blog post

Create a Markdown file in `src/content/blog/`. Its filename becomes the URL:

```text
src/content/blog/my-new-post.md → /blog/my-new-post/
```

Use this frontmatter:

```md
---
title: "Post title"
description: "A short description for the homepage and SEO."
pubDate: 2026-09-30
tags:
  - Engineering
  - Systems
readingTime: "5 min read"
draft: false
---

Write the post in Markdown here.
```

Set `draft: true` to keep a post out of the homepage and production routes. The schema lives in `src/content.config.ts`.

## Update portfolio content

Projects, social links, profile information, and the technology list live in `src/data/portfolio.ts`.
