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
- RULE-007: UX audit every UI change (see UX Design Skill below)

## UX Design Skill

When writing or modifying any UI code, operate as a **Senior UX Design Leader** with expertise in Behavioral Science, Cognitive Psychology, and Product Economics. Think like a Design Manager responsible for both user outcomes and business impact.

### Core Principles

**Behavioral Science Lens**
- Minimize cognitive load: fewer choices, clearer hierarchy, progressive disclosure
- Prevent decision fatigue: smart defaults, logical grouping, consistent patterns
- Respect mental models: use conventions users already know (school staff, parents, students)

**Economic Thinking**
- Every element must earn its place — question: "Is this necessary? Does it add value?"
- Prefer removing over adding
- Optimize for clarity, efficiency, and scalability
- Balance user needs, business goals, and system constraints

### Mandatory Checks on Every UI Change

**Accessibility & Usability**
- Contrast: text must pass WCAG AA (4.5:1 body, 3:1 large text)
- Readability: minimum 14px (0.875rem) body text, never below 12px for any text
- Tap targets: 44px minimum (enforced in base components)
- Interaction clarity: every interactive element must look interactive
- Keyboard navigable: all actions reachable via keyboard
- Error prevention: validate before submit, confirm destructive actions

**Responsive & Mobile-First (PWA)**
- Design for 320px first, then scale up (sm → md → lg → xl)
- Toolbars: `flex flex-col sm:flex-row` — stack on mobile, inline on desktop
- Tables: hide low-priority columns with `hidden sm:table-cell` / `hidden md:table-cell`
- Search inputs: `w-full sm:w-48` — full width on mobile, fixed on desktop
- Grids: start with `grid-cols-1`, add columns at breakpoints
- Navigation: bottom nav or hamburger drawer on mobile, sidebar on desktop
- Safe-area padding for notched devices in fixed elements

**Visual Hierarchy & Aesthetics**
- Prefer minimal, clean, structured interfaces — no visual noise
- Use color intentionally: for meaning (status), hierarchy (primary actions), and guidance (focus states)
- Maintain consistent spacing scale: 4px increments (gap-1 through gap-6)
- Typography hierarchy: page title (text-2xl bold) → section (text-lg semibold) → body (text-sm) → caption (text-xs muted)
- One primary action per view — make the most important action visually dominant
- Avoid excessive badges, icons, or decorative elements

**Flow Optimization**
- Reduce friction: minimize steps to complete any task
- Eliminate redundant actions and excessive controls
- Group related actions together
- Provide immediate feedback for every user action (loading states, success/error toasts)
- Empty states should guide users toward the next action

### Decision Framework

Before adding any UI element, ask:
1. **Does the user need this?** — If not, remove it
2. **Is it in the right place?** — Follow the user's natural flow
3. **Can it be simpler?** — Three lines of code > a premature abstraction
4. **Does it work on a 320px screen?** — Test mobile first
5. **Is it accessible?** — Keyboard, screen reader, color contrast

### Anti-Patterns to Avoid
- Walls of text — use hierarchy and white space
- Rainbow UIs — use color sparingly and with purpose
- Hidden functionality — if it matters, make it visible
- Modal overuse — prefer inline or sheet patterns
- Pagination when infinite scroll or virtual lists work better
- Tooltips for critical information — show it directly
- Loading spinners without context — tell users what's loading

## Next Session Starts At
Week 2 — NextAuth v5 login for all 5 portals
