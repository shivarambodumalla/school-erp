# School ERP — Full Context Snapshot
> Generated: 2026-03-24. Paste this into any Claude chat to get it in sync.

---

## Project Overview
Multi-tenant School ERP system. One Next.js app serves 5 portals (Admin, Teacher, Student, Parent, Instructor) each scoped to an `institutionId`.

---

## Phase / Status
- **Week 1 complete** — Foundation, DB, Auth, Admin shell
- **Week 2 next** — NextAuth v5 login for all 5 portals (deeper portal routing, role-based guards)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| API | tRPC v11 |
| Auth | NextAuth v5 (beta.30) — JWT strategy |
| ORM | Prisma v5 |
| Database | PostgreSQL |
| Animations | Framer Motion |
| State | TanStack Query (via tRPC) |
| Validation | Zod v4 |

---

## Repo Structure
```
school-erp/
├── CLAUDE.md               # Project rules (authoritative)
├── CONTEXT.md              # This file
└── client/                 # Entire app lives here
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   └── migrations/
    │       ├── 20260305141322_init/
    │       └── 20260307085603_add_masquerade_mode/
    └── src/
        ├── app/            # Next.js App Router pages & API routes
        ├── components/     # Shared UI components
        ├── features/       # Feature modules (one folder per domain)
        ├── hooks/          # Custom React hooks
        ├── lib/            # Utilities, constants, Prisma client
        ├── server/         # Auth config + tRPC routers
        ├── types/          # Global TypeScript types
        └── middleware.ts   # Auth guard (redirects unauthenticated users)
```

---

## Routes (App Router)
```
/                               → root page (redirects to /dashboard)
/auth/login                     → login page (public)
/dashboard                      → generic dashboard
/management/
  layout.tsx                    → ManagementSidebar + TopBar shell
  dashboard/                    → management dashboard
  users/                        → users list (management-level)
  admin/
    users/                      → super-admin users table (AdminUsersTable)
    users/[userId]/             → user profile + change password
/consumer/
  layout.tsx                    → ConsumerBottomNav shell (mobile)
  dashboard/                    → consumer dashboard
/api/
  health/                       → health check
  trpc/[trpc]/                  → tRPC handler
  masquerade/
    start/                      → POST — begin masquerade session
    stop/                       → POST — end masquerade session
    context/                    → GET — current masquerade context
```

---

## Database Schema (Prisma)
### Core Models
- **Institution** — multi-tenant root; has `subdomain`, `primaryColor`, `logoUrl`, `planTier` (STARTER/GROWTH/PRO), `board` (CBSE/ICSE/STATE)
- **User** — `institutionId`, `email`, `hashedPassword`, `portalType` (ADMIN/TEACHER/STUDENT/PARENT/INSTRUCTOR), `isActive`, `lastLoginAt`
- **Student** — `institutionId`, `admissionNo`, `firstName`, `lastName`, `dateOfBirth`, `gender`, `classId`, `sectionId`, `guardianName/Phone`, `status`
- **Role** — `institutionId`, `name`, `isSystemRole`, `permissions` (JSON), `masqueradeMode` (READ_ONLY/FULL_ACCESS/DISABLED)
- **AcademicYear**, **Class**, **Section**, **Attendance**, **FeePayment**, **AuditLog**

### Key Enums
`PortalType`, `PlanTier`, `Board`, `Gender`, `StudentStatus`, `AttendanceStatus`, `PaymentMethod`, `PaymentStatus`, `MasqueradeMode`

---

## Auth (NextAuth v5)
- **Provider**: Credentials only
- **Strategy**: JWT (30-day session)
- **Session fields**: `id`, `email`, `portalType`, `institutionId`, `institutionName`, `institutionSubdomain`, `primaryColor`, `logoUrl`, `permissions`
- **Permissions**: resolved at login from `DEFAULT_ROLE_PERMISSIONS[portalType]` in `src/lib/permissions.ts` (custom DB roles planned for later)
- **Middleware** (`src/middleware.ts`): redirects unauthenticated → `/auth/login`; logged-in on `/auth/login` → `/dashboard`

---

## Masquerade Mode
Admins can "masquerade" as other users to view their portal.
- **Components**: `MasqueradeBar`, `MasqueradeFrame`, `MasqueradeReadOnlyOverlay`
- **Hook**: `useMasquerade.ts`
- **API routes**: `/api/masquerade/start`, `/api/masquerade/stop`, `/api/masquerade/context`
- **Lib**: `src/lib/masquerade.ts`
- **Role config**: each `Role` has `masqueradeMode` — `READ_ONLY`, `FULL_ACCESS`, or `DISABLED`
- **Feature component**: `MasqueradeButton` (in admin users table)

---

## Feature Modules (src/features/)
| Module | Status |
|---|---|
| `admin/` | Active — AdminUsersTable, UserProfile, MasqueradeButton, changePassword action |
| `users/` | Active — UsersTable component |
| `students/` | Stub (`index.ts` only) |
| `attendance/` | Stub |
| `fees/` | Stub |
| `courses/` | Stub |
| `grades/` | Stub |
| `timetable/` | Stub |
| `reports/` | Stub |
| `roles/` | Stub |
| `settings/` | Stub |
| `bus/` | Stub |
| `vibe/` | Stub |

---

## Shared Components (src/components/)
- **Layout**: `AdminSidebar`, `ManagementSidebar`, `TopBar`, `BottomNav`, `ConsumerBottomNav`
- **Shared**: `MasqueradeBar`, `MasqueradeFrame`, `MasqueradeReadOnlyOverlay`, `PageTransition`, `SkeletonCard`, `StatCard`
- **UI (shadcn)**: `alert`, `avatar`, `badge`, `button`, `card`, `input`, `label`, `separator`, `switch`, `table`, `tabs`
- **Theme**: `theme-provider`, `theme-toggle`

---

## Hooks (src/hooks/)
- `useMasquerade` — masquerade state management
- `useMobile` — mobile breakpoint detection
- `usePortal` — current portal type from session
- `useTenant` — current institution context from session

---

## Architecture Rules (non-negotiable)
1. **route → service → repository** — never skip layers
2. **institutionId on EVERY DB query** — multi-tenant isolation
3. **Never query DB from components**
4. **No secrets in Git**
5. **service/repository pattern always**
6. **Mobile first — 44px minimum tap targets**
7. **No `any` TypeScript types**

---

## tRPC Setup
- Router: `src/server/trpc/routers/index.ts`
- Base: `src/server/trpc/trpc.ts`
- API handler: `src/app/api/trpc/[trpc]/route.ts`

---

## Recent Git History
```
1e39bee feat: implement masquerade mode for admins
bb24cd8 style: polish admin users table and user profile pages
aa66abd feat: add super admin users page with profile view and password change
7c91cd8 feat: add users management page with search and sortable table
738408d fix: resolve route conflict by moving route groups to actual path segments
b1f269e chore: add PostgreSQL setup, Prisma v5 migration, and seed data
4687f1d feat: 2-shell permission architecture with NextAuth, management/consumer shells
78844c7 refactor: simplify login page, remove portal selector
d7cebed feat: add login page with portal selector and redirect root to auth
74b86e0 refactor: restructure to Next.js-only architecture
```

---

## What's Next (Week 2)
- NextAuth v5 login flow for all 5 portals
- Portal-specific route guards (e.g. teachers can't access admin routes)
- Role-based permission checks beyond default per-portal permissions
