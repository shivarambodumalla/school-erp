---
description: User preferences and decisions for the School ERP project. MUST be checked before making any architectural, tooling, or design decision. Violations must be flagged to the user.
---

# Project Preferences & Decisions

> **Rule:** Before installing a package, choosing a tool, or making an architectural decision, check this file AND `.agent/tech-stack.md`. If the proposed action contradicts either file, STOP and inform the user before proceeding.

## Enforced Rules

### 1. Tech Stack Lock
- **Only use tools listed in `tech-stack.md`** unless the user explicitly approves an alternative.
- Never substitute a listed tool with a competitor (e.g., don't use Drizzle instead of Prisma, don't use Clerk instead of NextAuth).
- If a task needs a tool not in the stack, ask first.

### 2. Styling & UI
- **Tailwind CSS v3** for all styling. No CSS modules, no styled-components.
- **shadcn/ui** for all UI components. No Material UI, Ant Design, Chakra, etc.
- Theme variables are defined in `globals.css` — use them, don't hardcode colors.

### 3. TypeScript
- **Strict mode always.** No `any` types. No `@ts-ignore` without a comment explaining why.
- All API inputs validated with **Zod** schemas.

### 4. Database
- **Prisma v5** as ORM. No raw SQL unless absolutely necessary (and commented).
- **PostgreSQL v15**. No MongoDB, no SQLite in production.

### 5. API Pattern
- **tRPC v11** for all API communication. No REST endpoints unless integrating with third-party webhooks.

### 6. Auth
- **NextAuth v5** with role + institutionId in JWT. No custom auth implementations.

### 7. Code Quality
- ESLint + strict TypeScript are non-negotiable.
- Prefer server components by default; use `"use client"` only when needed.

### 8. Payments (India-specific)
- **Razorpay** for payments. No Stripe (poor UPI support in India).

### 9. Deployment Target
- **AWS Mumbai region** for DPDP Act compliance.
- ARM-based instances (t4g) preferred for cost.

---

## Decisions Log

Record important design decisions here as they are made.

| Date | Decision | Reasoning |
|---|---|---|
| 2026-03-03 | Custom warm theme palette (terracotta primary, rose secondary) | User provided specific hex values for light and dark mode |
| 2026-03-03 | Monorepo: `client/` + `server/` under `starter-app/` | Clean separation of Next.js frontend and Express API |

---

## How This Works

1. **Before every task**, the agent reads this file and `tech-stack.md`.
2. If the agent is about to use a tool/pattern not listed, it **must flag it** to the user.
3. New decisions are appended to the **Decisions Log** table above.
4. The user can update rules at any time by editing this file or telling the agent.
