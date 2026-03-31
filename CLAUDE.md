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
- RULE-008: URL routing conventions (see URL & Navigation Rules below)

## URL & Navigation Rules

All navigation MUST use path segments. Never query params for resource IDs.

### Route Patterns (management portal)
```
/management/dashboard
/management/students/[id]           ← cuid or serialNo (numeric)
/management/staff/[id]              ← cuid or serialNo (numeric)
/management/departments/[id]        ← cuid
/management/departments/[id]/edit
/management/institution/classes/[id] ← cuid (classYearId)
/management/subjects/[id]           ← cuid
/management/subjects/[id]/gradebook
/management/courses/[id]            ← cuid
/management/admissions/[id]         ← cuid
/management/admissions/new
/management/staff/roles             ← list (no ID)
/management/staff/payroll           ← list (no ID)
/management/staff/leaves            ← list (no ID)
/management/settings                ← settings root
/management/settings/[subpage]      ← branding, admissions, etc.
```

### Route Patterns (super admin portal)
```
/super/dashboard
/super/institutions/[id]            ← cuid
/super/institutions/[id]/manage     ← manages as school admin
/super/institutions/[id]/edit
/super/users
/super/roles
/super/tickets
/super/analytics
/super/settings
```

### Route Patterns (consumer portal)
```
/consumer/dashboard
/consumer/subjects/[id]             ← cuid
/consumer/subjects/[id]/quiz/[quizId]
/consumer/courses/[id]              ← cuid
/consumer/grades
/consumer/homework
/consumer/fees
/consumer/bus
/consumer/profile
```

### Rules
1. **Always path segments** — `/resource/[id]`, never `?id=xxx`
2. **Query params OK for UI state** — `?tab=overview`, `?status=active` are fine
3. **Prefer serialNo in URLs** when the model has one (Staff, Student) — API routes must accept both cuid and serialNo via `isNumeric` check
4. **Dynamic route folders** use descriptive param names: `[deptId]`, `[staffId]`, `[studentId]`
5. **Page route files** — every `[param]` folder must have `page.tsx` + `loading.tsx` + `error.tsx`
6. **Link components** — use `<Link href={...}>` for static nav, `router.push()` for programmatic
7. **No hardcoded IDs in URLs** — always use variables: `` `/management/staff/${staff.id}` ``
8. **API routes mirror page routes** — `/api/school/departments/[deptId]` matches `/management/departments/[deptId]`

### When Adding New Features
1. Add the route pattern to this list
2. Create the `[param]` folder with page.tsx + loading.tsx + error.tsx
3. If the model has serialNo, make the API accept both cuid and numeric
4. Add nav item to `src/lib/nav.ts` in the correct group
5. All links from cards, tables, lists use path segments with the record's id

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
