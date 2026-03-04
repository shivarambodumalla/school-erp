---
description: Pre-flight check before any implementation task. Ensures tech stack, preferences, coding standards, and folder structure are respected.
---

# Pre-Implementation Check

Before starting any implementation task:

1. Read `CLAUDE.md` in the project root — check current phase/week.
2. Read `.agent/tech-stack.md` — confirm the correct tool/version for the task.
3. Read `.agent/preferences.md` — check enforced rules and past decisions.
4. Read `.agent/coding-standards.md` — review all hard rules before writing code.
5. Read `.agent/folder-structure.md` — confirm where new files should go.
6. If the task requires a tool NOT in the tech stack, ask the user before proceeding.
7. If a decision contradicts a logged preference or coding standard, flag it to the user with the specific rule being violated.
8. After making a significant architectural decision, append it to the **Decisions Log** in both `preferences.md` and `CLAUDE.md`.

# Task Completion Report

After completing any task, report in this format:

```
Task complete. Checklist passed:
 ✅ TypeScript — zero errors
 ✅ ESLint — zero warnings
 ✅ institutionId — scoped on all queries
 ✅ Mobile — 44px targets, no overflow
 ✅ CLAUDE.md — updated

 Files created/modified: [list them]
 Next session should start at: [what comes next]
```
