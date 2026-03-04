---
description: Pre-flight check before any implementation task. Ensures tech stack and preferences are respected.
---

# Pre-Implementation Check

Before starting any implementation task:

1. Read `.agent/tech-stack.md` to confirm the correct tool/version for the task.
2. Read `.agent/preferences.md` to check enforced rules and past decisions.
3. If the task requires a tool NOT in the tech stack, ask the user before proceeding.
4. If a decision contradicts a logged preference, flag it to the user with the specific rule being violated.
5. After making a significant architectural decision, append it to the **Decisions Log** in `preferences.md`.
