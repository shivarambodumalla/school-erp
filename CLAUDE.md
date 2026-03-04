# SCHOOL ERP — Living Context Document

> **This file is the single source of truth.** Read it completely before starting any task.
> Updated: 2026-03-04

---

## Current Phase

Phase: **Project Setup / Foundation**
Week: 1

---

## Project Overview

Multi-tenant School ERP serving 5 portal roles: Admin, Teacher, Student, Parent, Instructor.
Each school is identified by `institutionId` — every DB query must scope to it.

---

## Tech Stack

See `.agent/tech-stack.md` for the complete list. Key choices:
- **Next.js 14** (App Router) + **TypeScript strict** + **Tailwind v3** + **shadcn/ui**
- **tRPC v11** + **Zod v3** for API
- **NextAuth v5** for auth (role + institutionId in JWT)
- **Prisma v5** + **PostgreSQL 15** (AWS RDS Mumbai)
- **Razorpay** for payments (UPI-first, India market)

---

## Folder Structure

See `.agent/folder-structure.md` for the full tree. Key conventions:
- `apps/web/server/services/` — business logic only
- `apps/web/server/repositories/` — DB queries only (always with institutionId)
- `apps/web/server/trpc/routers/` — tRPC procedures
- `packages/db/` — Prisma schema, seed, client
- `packages/shared/` — TS types, constants, utils

---

## Coding Standards

See `.agent/coding-standards.md` for the complete rules. Critical rules:
- **ZERO `any` types** — use `unknown` and narrow
- **ZERO non-null assertions** — check and throw
- **Service/Repository pattern** — always
- **institutionId on every query** — always
- **Server components by default** — `'use client'` only when needed
- **No console.log** — use console.warn/error
- **44px minimum** touch targets on all interactive elements
- **Skeleton loading** on all data-fetching components

---

## Portal Themes

| Portal | Theme Color | Navigation |
|---|---|---|
| Admin | Blue | Sidebar |
| Teacher | Indigo | Sidebar |
| Student | Violet | Bottom tabs |
| Parent | Emerald | Bottom tabs |
| Instructor | Amber | Sidebar |

---

## Guardian Rules

These rules can NEVER be broken, regardless of convenience:

1. **Every DB query must include `institutionId`** — no exceptions
2. **No secrets in code** — always environment variables
3. **No `any` types** — zero tolerance
4. **No data fetching in useEffect** — use tRPC hooks
5. **No querying Prisma from components** — components → tRPC → services → repos

---

## Decisions Log

| Date | Decision | Reasoning |
|---|---|---|
| 2026-03-03 | Custom warm theme (terracotta primary, rose secondary) | User-specified hex palette |
| 2026-03-03 | Monorepo: client/ + server/ under starter-app/ | Clean separation |
| 2026-03-04 | Added success/warning/error color tokens | User-specified per-theme values |
| 2026-03-04 | Coding standards saved to .agent/coding-standards.md | Enforced on every task |

---

## What To Do When Starting a New Session

1. Read this file completely
2. Read `.agent/preferences.md` for enforced rules
3. Read `.agent/coding-standards.md` for code quality rules
4. Check which phase/week we are in
5. Check `.agent/folder-structure.md` before creating any file
