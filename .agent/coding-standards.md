# CODING STANDARDS — SCHOOL ERP PROJECT
# Read and follow ALL of these on every task, every file, every session.
# These are not suggestions. They are hard rules.

━━━ BEFORE YOU WRITE A SINGLE LINE OF CODE ━━━

1. Read CLAUDE.md in the project root completely
2. Check which phase/week we are in
3. Check the folder structure — never invent new patterns
4. Confirm the task does not violate any Guardian Rule in CLAUDE.md

━━━ TYPESCRIPT RULES — NON-NEGOTIABLE ━━━

RULE-TS-001: ZERO `any` types. Ever.
  If you don't know the type, use `unknown` and narrow it.
  If a library has bad types, use a proper type assertion with a comment explaining why.
  WRONG:  const data: any = response
  RIGHT:  const data: StudentResponse = response

RULE-TS-002: ZERO non-null assertions (!).
  WRONG:  const name = student!.firstName
  RIGHT:  if (!student) throw new Error('Student not found')
          const name = student.firstName

RULE-TS-003: Always use `import type` for type-only imports.
  WRONG:  import { Student } from '@prisma/client'
  RIGHT:  import type { Student } from '@prisma/client'

RULE-TS-004: Every function must have explicit return types.
  WRONG:  async function getStudent(id: string) {
  RIGHT:  async function getStudent(id: string): Promise<Student | null> {

RULE-TS-005: No implicit returns. Every branch must return.

RULE-TS-006: Use Zod for ALL runtime validation.
  Never trust external input — API inputs, webhook payloads, form data.
  Always validate with a Zod schema before using the data.

━━━ ARCHITECTURE RULES — NON-NEGOTIABLE ━━━

RULE-ARCH-001: Service / Repository pattern. Always.
  HTTP handler (route.ts) → calls Service (*.service.ts) → calls Repository (*.repo.ts)
  WRONG: querying Prisma directly inside a route.ts or component
  RIGHT: route.ts calls studentService.getById(id)
         studentService calls studentRepo.findById(id)

RULE-ARCH-002: Every DB query must include institutionId.
  This is a multi-tenant app. Missing institutionId = data leak between schools.
  WRONG:  prisma.student.findMany()
  RIGHT:  prisma.student.findMany({ where: { institutionId } })
  Before finishing any repository file, grep it for queries missing institutionId.

RULE-ARCH-003: Never query DB from a React component.
  Components call tRPC hooks. tRPC routers call services. Services call repos.
  Never import prisma into a component file.

RULE-ARCH-004: All secrets come from environment variables.
  Never hardcode API keys, passwords, or tokens.
  Always use process.env.VARIABLE_NAME
  Always add new variables to .env.example with empty value.

RULE-ARCH-005: Error handling on every async operation.
  Every async function must have try/catch or propagate errors intentionally.
  tRPC procedures must throw TRPCError with correct code (NOT_FOUND, UNAUTHORIZED etc.)

RULE-ARCH-006: No circular imports between packages.
  Import direction: apps → packages/api-client → packages/shared → packages/db

━━━ REACT / NEXT.JS RULES ━━━

RULE-NEXT-001: Always use next/image, never <img>.
RULE-NEXT-002: Always use next/link, never <a> for internal links.
RULE-NEXT-003: Every page must have a loading.tsx skeleton.
RULE-NEXT-004: Every layout must have an error.tsx boundary.
RULE-NEXT-005: Server components by default. Add 'use client' only when needed.
RULE-NEXT-006: Never use useEffect for data fetching. Use tRPC hooks instead.

━━━ MOBILE / PWA RULES ━━━

RULE-MOBILE-001: Every interactive element must be minimum 44px height/width.
RULE-MOBILE-002: No horizontal scroll on any screen at 375px width.
RULE-MOBILE-003: Use Skeleton loading on every data-fetching component.
RULE-MOBILE-004: Use PageTransition wrapper on every portal page.
RULE-MOBILE-005: Bottom navigation for parent and student portals only.

━━━ CODE QUALITY RULES ━━━

RULE-QUALITY-001: No console.log in any committed code.
RULE-QUALITY-002: No commented-out code.
RULE-QUALITY-003: Function complexity limit — max 15 lines of logic.
RULE-QUALITY-004: Meaningful names only.
RULE-QUALITY-005: No magic numbers or strings.
RULE-QUALITY-006: Prefer early returns to reduce nesting.

━━━ THEMING RULES ━━━

RULE-THEME-001: Never hardcode colors — always use CSS variables.
RULE-THEME-002: Every new portal screen must have data-portal set on its layout.
RULE-THEME-003: Per-school brand color comes from institution.primaryColor in DB.

━━━ FOLDER STRUCTURE RULES ━━━

RULE-FOLDER-001: New business logic goes in server/services/
RULE-FOLDER-002: New DB queries go in server/repositories/
RULE-FOLDER-003: New tRPC procedures go in server/trpc/routers/
RULE-FOLDER-004: New reusable UI components go in components/shared/
RULE-FOLDER-005: New portal-specific components go inside the portal folder
RULE-FOLDER-006: Never create a new top-level folder without updating CLAUDE.md

━━━ NAMING RULES ━━━

Files:           kebab-case     student-profile.tsx, fee.service.ts
Components:      PascalCase     StudentProfile, FeeCard
Functions:       camelCase      getStudentById, calculateFee
DB tables:       snake_case     student_attendance, fee_payments
Constants:       UPPER_SNAKE    MAX_FILE_SIZE, RISK_THRESHOLD
tRPC routers:    camelCase noun students, fees, attendance
tRPC procedures: verb.noun      getById, createStudent, markAttendance
CSS variables:   kebab --prefix --primary, --background
Env variables:   UPPER_SNAKE    DATABASE_URL, RAZORPAY_KEY_ID

━━━ COMMIT MESSAGE RULES ━━━

Format: type: short description in lowercase
Valid types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert

━━━ TASK COMPLETION CHECKLIST ━━━

Before reporting any task as done, verify:
[ ] Zero TypeScript errors (tsc --noEmit passes)
[ ] Zero ESLint errors (eslint passes with --max-warnings 0)
[ ] No `any` types in any file touched
[ ] No `console.log` in any file touched
[ ] Every DB query has institutionId scoping
[ ] No secrets hardcoded anywhere
[ ] New env variables added to .env.example
[ ] Mobile: all interactive elements 44px minimum
[ ] Mobile: no horizontal scroll at 375px
[ ] Skeleton loading on data-fetching components
[ ] Imports organized (types separate, grouped correctly)
[ ] Functions named meaningfully
[ ] CLAUDE.md updated if any new decision was made
