---
description: Preferred monorepo folder structure for the School ERP project. Must be followed when creating new files, modules, or services.
---

# School ERP — Folder Structure

```
ROOT/
├── apps/
│   ├── web/                      ← Next.js 14
│   │   ├── app/
│   │   │   ├── (public)/         ← Landing page
│   │   │   ├── auth/login/       ← Portal selector login
│   │   │   └── (portals)/
│   │   │       ├── (admin)/      ← Blue theme
│   │   │       ├── (teacher)/    ← Indigo theme
│   │   │       ├── (student)/    ← Violet theme + bottom tabs
│   │   │       ├── (parent)/     ← Emerald theme + bottom tabs
│   │   │       └── (instructor)/ ← Amber theme
│   │   ├── server/
│   │   │   ├── trpc/routers/     ← tRPC procedures
│   │   │   ├── services/         ← Business logic ONLY
│   │   │   ├── repositories/     ← DB queries ONLY (always with institutionId)
│   │   │   ├── middleware/       ← Tenant, permissions, rate limit
│   │   │   └── jobs/             ← BullMQ queue + workers
│   │   ├── components/
│   │   │   ├── ui/               ← shadcn (you own these)
│   │   │   ├── layout/           ← AdminSidebar, BottomNav, TopBar
│   │   │   ├── shared/           ← PageTransition, StatCard, Skeleton
│   │   │   └── charts/           ← Recharts wrappers
│   │   ├── hooks/                ← useTenant, usePortal, useMobile, useSwipeBack
│   │   ├── styles/globals.css    ← Tailwind + all 5 portal CSS variables
│   │   ├── middleware.ts          ← Subdomain → institution_id
│   │   └── public/manifest.json  ← PWA manifest
│   │
│   ├── ai-service/               ← Python FastAPI
│   │   ├── main.py
│   │   ├── routers/              ← health, risk_score, lesson_plan
│   │   ├── models/               ← Pydantic schemas
│   │   └── requirements.txt + Dockerfile
│   │
│   ├── gps-service/              ← Node.js GPS ingestion
│   │   └── index.ts + Dockerfile
│   │
│   └── docs/                     ← Starlight (help.yourapp.com)
│       └── src/content/docs/     ← MDX per role
│
├── packages/
│   ├── db/                       ← Prisma schema + seed + client
│   ├── shared/                   ← TS types, constants, utils
│   ├── api-client/               ← tRPC client (web now, mobile later)
│   └── email/                    ← React Email templates
│
├── .github/workflows/            ← CI/CD
├── turbo.json
├── pnpm-workspace.yaml
├── CLAUDE.md                     ← Living context — agents read this first
└── tsconfig.base.json
```

## Key Conventions

- **Route groups** `(public)`, `(portals)`, `(admin)`, etc. are Next.js route groups — no URL segment.
- **server/** lives inside `apps/web/`, not as a separate Express app.
- **Business logic** goes in `services/`, **DB queries** go in `repositories/` — never mix.
- **Repositories always filter by `institutionId`** for multi-tenancy.
- **Shared packages** (`db`, `shared`, `api-client`, `email`) live in `packages/` and are consumed by all apps.
- **Portal themes**: Admin=Blue, Teacher=Indigo, Student=Violet, Parent=Emerald, Instructor=Amber.
- **Student and Parent portals** use bottom tab navigation (mobile-first).
