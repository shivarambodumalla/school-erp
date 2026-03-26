# ONFLOWS — PROJECT CONTEXT

## Product
- Name: Onflows
- Domain: onflows.app
- Tagline: Your school. In flow.
- Description: Multi-tenant School ERP + LMS + Community platform

## Current State
Phase: Week 1 — Foundation complete
Status: Structure fixed, auth next

## Structure
- client/ — Next.js 14 App Router (everything lives here)
- server/ — deleted, all backend inside client/src/server/
- Python AI service — not needed until Phase 10

## Stack
Next.js 14, TypeScript strict, Tailwind, shadcn,
tRPC, NextAuth v5, PostgreSQL, Prisma

## Architecture Rules
- route → service → repository (never skip layers)
- institutionId on EVERY DB query (multi-tenant)
- Never query DB from components
- No secrets in Git

## Guardian Rules
- RULE-001: No any TypeScript types
- RULE-002: Always include institutionId in DB queries
- RULE-003: Never query DB from components
- RULE-004: No secrets in Git
- RULE-005: service/repository pattern always
- RULE-006: Mobile first — 44px minimum tap targets

## Next Session Starts At
Week 2 — NextAuth v5 login for all 5 portals
