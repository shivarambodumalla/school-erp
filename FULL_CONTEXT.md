# ONFLOWS — Complete Project Context
> Generated: 2026-04-02. Paste this into any Claude chat to get full project context for planning, ideation, and implementation.

---

## 1. Product Overview

- **Name:** Onflows
- **Domain:** onflows.app
- **Tagline:** Your school. In flow.
- **Description:** Multi-tenant School ERP + LMS + Community platform
- **Current Phase:** Week 1+ Foundation complete, Week 2 — NextAuth v5 deepening
- **Target Users:** Schools (K-12), Colleges, Training Centers across India (CBSE/ICSE/STATE boards)

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS + shadcn/ui (new-york) | 3.4.x |
| API (planned) | tRPC | v11.11 |
| Auth | NextAuth v5 (beta.30) — JWT strategy | 5.0.0-beta.30 |
| ORM | Prisma | v5.22 |
| Database | PostgreSQL | — |
| Animations | Framer Motion | 12.x |
| State | TanStack React Query (via tRPC) | 5.x |
| Validation | Zod | v4.3 |
| Charts | Recharts | 3.7 |
| Forms | react-hook-form + @hookform/resolvers | 7.x |
| Drag & Drop | @dnd-kit/core + sortable | 6.x / 10.x |
| Markdown | react-markdown + remark-math + rehype-katex | — |
| Gestures | react-swipeable | 7.x |
| Toasts | sonner | 2.x |
| Icons | lucide-react | 0.576 |
| Testing | Vitest + @testing-library/react + jsdom | 4.x |
| Deployment | Render (Singapore, free tier) | — |
| File Storage | Cloudinary | — |

---

## 3. Repository Structure

```
school-erp/
├── CLAUDE.md                    # Project rules & guardian rules (authoritative)
├── CONTEXT.md                   # Older context snapshot (Week 1)
├── FULL_CONTEXT.md              # THIS FILE — complete context
├── render.yaml                  # Render deployment config
└── client/                      # ENTIRE app lives here (no separate server)
    ├── package.json
    ├── next.config.js           # standalone output, Cloudinary images
    ├── tsconfig.json            # strict: true, @/* → ./src/*
    ├── tailwind.config.ts       # CSS variable theming, custom colors
    ├── components.json          # shadcn/ui config (new-york style)
    ├── .env.example             # DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL
    ├── prisma/
    │   ├── schema.prisma        # ~2375 lines, 63+ models, 28+ enums
    │   ├── seed.ts              # 59KB seed with demo school data
    │   └── migrations/
    └── src/
        ├── middleware.ts        # Auth guard, portal routing, subdomain resolution
        ├── app/                 # Next.js App Router
        │   ├── layout.tsx       # Root: SessionProvider + ThemeProvider + Masquerade
        │   ├── page.tsx         # Redirects to /auth/login
        │   ├── globals.css
        │   ├── auth/login/      # Login page
        │   ├── management/      # Admin/Teacher shell (sidebar layout)
        │   ├── consumer/        # Student/Parent shell (bottom nav layout)
        │   ├── super/           # Super Admin shell (sidebar layout)
        │   └── api/             # 190+ REST API route handlers
        ├── server/
        │   ├── auth.ts          # NextAuth config (Credentials, JWT, bcryptjs)
        │   ├── trpc/            # tRPC setup (skeleton, not yet used)
        │   ├── services/        # Business logic layer (placeholder)
        │   ├── repositories/    # Data access layer (placeholder)
        │   └── middleware/      # Auth middleware (placeholder)
        ├── components/
        │   ├── layout/          # ManagementSidebar, ConsumerBottomNav, SuperSidebar, TopBar, NotificationBell
        │   ├── shared/          # MasqueradeBar/Frame/Overlay, ThemeInjector, ErrorBoundary, StatCard, SkeletonCard, PageTransition
        │   └── ui/              # 29 shadcn components (button, dialog, sheet, tabs, table, form, etc.)
        ├── features/            # 30 feature modules (domain-organized)
        ├── hooks/               # 7 custom hooks
        ├── lib/                 # Utilities, constants, permissions, nav, colors, prisma client
        ├── types/               # Global TS types + NextAuth augmentation
        └── fonts/               # Geist Sans/Mono
```

---

## 4. Architecture

### 4.1 Three-Shell Architecture

The app serves 6 portal types across 3 UI shells:

| Shell | Portal Types | Route Prefix | Layout |
|---|---|---|---|
| Management | ADMIN, TEACHER, INSTRUCTOR | `/management/*` | Fixed sidebar (280px) + main content |
| Consumer | STUDENT, PARENT | `/consumer/*` | Bottom nav (mobile-first) + main content |
| Super Admin | SUPER_ADMIN | `/super/*` | Fixed sidebar + main content |

### 4.2 Multi-Tenancy

- **Subdomain routing:** `stmarys.onflows.app` → resolves `institutionId` in middleware
- **Data isolation:** `institutionId` is a required field on EVERY model and EVERY query
- **Composite unique constraints:** e.g., `[institutionId, email]`, `[institutionId, name]`
- **Super admin override:** `?iid=institutionId` query param for managing any institution

### 4.3 Code Layering (Enforced Rules)

```
Page/Component → API Route → Service → Repository → Prisma
```
- **Never** query DB from components
- **Never** skip the service/repository layers
- **No `any`** TypeScript types
- **No secrets** in Git
- **Mobile first** — 44px minimum tap targets

### 4.4 Current API Pattern

All 190+ API routes currently use this pattern (services/repos not yet extracted):
```typescript
export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  // Direct Prisma query with institutionId
}
```

---

## 5. Authentication & Authorization

### 5.1 NextAuth v5 Configuration

- **Provider:** Credentials (email + password)
- **Strategy:** JWT with 30-day max age
- **Password hashing:** bcryptjs
- **Login flow:** validate credentials → bcrypt.compare → update lastLoginAt → resolve default permissions → issue JWT

### 5.2 Session Shape

```typescript
session.user = {
  id, email, portalType,
  institutionId, institutionName, institutionSubdomain,
  primaryColor, secondaryColor, themePalette, darkPalette, logoUrl,
  permissions: Permission[]  // resolved from DEFAULT_ROLE_PERMISSIONS[portalType]
}
```

### 5.3 Permission System (67 permissions)

| Category | Permissions |
|---|---|
| Fees | view, collect, waive, report |
| Attendance | view, mark, report |
| Students | view, create, edit, delete |
| Staff | view, manage |
| Grades | view, enter, report |
| Timetable | view, manage |
| Courses | view, enroll, create, manage |
| Vibe | view, post, moderate |
| Reports | view, export |
| Settings | view, manage |
| Roles | view, manage |
| Bus | view, manage |
| AI | insights, lesson_plan |
| Masquerade | read_only, full_access |
| Audit | view |
| Documents | view, upload |
| Calendar | view, manage |
| Tickets | view, manage |
| Communications | view |
| Platform | admin (super admin only) |

### 5.4 Default Role Permissions

| Role | Summary |
|---|---|
| **SUPER_ADMIN** | All 67 permissions |
| **ADMIN** | Everything except platform.admin; masquerade read-only |
| **TEACHER** | Attendance (view/mark), Students (view), Grades (view/enter), AI |
| **INSTRUCTOR** | Courses (create/manage), Students (view) |
| **PARENT** | Fees (view), Attendance (view), Grades (view), Bus (view) |
| **STUDENT** | Fees (view), Attendance (view), Grades (view), Courses (enroll) |

### 5.5 Middleware (src/middleware.ts)

1. Extracts subdomain for tenant resolution
2. Unauthenticated → redirect to `/auth/login`
3. SUPER_ADMIN on `/management/*` → redirect to `/super/dashboard`
4. Non-SUPER_ADMIN on `/super/*` → redirect to `/dashboard`
5. Public routes: `/`, `/auth/login`, `/auth/error`, `/api/auth/*`, `/api/health`

### 5.6 Masquerade Mode

- SUPER_ADMIN and ADMIN can impersonate lower-rank portals
- Modes: READ_ONLY (visual only) or FULL_ACCESS (can act)
- Cookies: `masquerade_as`, `masquerade_mode`, `masquerade_initiator`
- UI: yellow border frame, bottom bar with "stop" button, read-only overlay

---

## 6. Database Schema (Prisma)

### 6.1 Stats
- **63+ models**, **28+ enums**, **~2375 lines**
- Multi-tenant with `institutionId` on every model
- Composite unique constraints for institution-scoped uniqueness
- Auto-increment `serialNo` on Student, Staff, ClassYear, Admission, Subject for URL-friendly IDs

### 6.2 Core Models

**Institution** — Multi-tenant root
- name, subdomain (unique), planTier (STARTER/GROWTH/PRO), board (CBSE/ICSE/STATE)
- Branding: primaryColor, secondaryColor, themePalette, darkPalette, logoUrl, squareLogoUrl, faviconUrl
- Address, phone, website, establishedYear, studentCapacity, institutionType
- isActive, suspendedAt, suspendedReason, billingEmail, customPricing

**User** — Login credentials
- institutionId, email (unique per institution), hashedPassword
- portalType (SUPER_ADMIN/ADMIN/TEACHER/STUDENT/PARENT/INSTRUCTOR)
- isActive, lastLoginAt

**PlatformUser / PlatformRole** — Super admin accounts (separate from institution users)

**Role** — Institution-level custom roles
- institutionId, name, isSystemRole, permissions (JSON), masqueradeMode

### 6.3 Academic Structure

```
AcademicYear (e.g., 2024-25)
  └── ClassYear (instance of ClassTemplate in a year)
       ├── Section (A, B, C — with maxStrength, classTeacher)
       │    └── StudentSection (enrollment junction with status tracking)
       ├── Subject (with teachers, content, grades)
       └── ExamSchedule, Attendance, PromotionRecord
```

**ClassTemplate** — Blueprint (e.g., "Class 6", "Class 7")
**ClassYear** — Instance per academic year, with serialNo, status (ACTIVE/ARCHIVED/DRAFT), clonedFromId
**Section** — Division within ClassYear, maxStrength, classTeacherId
**StudentSection** — Tracks enrollment: status (ACTIVE/PROMOTED/DETAINED/TRANSFERRED/GRADUATED)
**ClassTeacherAssignment** — Links staff to section per academic year

### 6.4 Student Models

**Student** — Core record with serialNo (auto-increment)
- Personal: firstName, middleName, lastName, dateOfBirth, gender, bloodGroup, nationality, religion, motherTongue, photoUrl
- IDs: sisId, admissionNo (unique per institution), rollNo
- Health: allergies[], medicalConditions (JSON), emergencyDoctor
- Transport: transportMode, busRouteId, pickupStop, dropStop, boardingType, hostelRoom
- Status: ACTIVE/INACTIVE/TRANSFERRED
- 25+ relations (guardians, documents, achievements, incidents, attendance, grades, etc.)

**Guardian** — type (FATHER/MOTHER/GUARDIAN), relationship, name, phone, email, occupation, annualIncome
- isPrimaryContact, isEmergencyContact, canLogin, userId (for parent portal)
- Can relate to Admission or Student

**StudentDocument** — fileUrl, fileName, fileSize, mimeType, isVerified, verifiedById
**StudentIdCard** — issuedAt, validTill, fileUrl, isActive
**StudentSibling** — Self-referential sibling relationship
**StudentExit** — exitType (TRANSFER/GRADUATED/WITHDRAWN), exitDate, destinationSchool

### 6.5 Admission Pipeline

**Inquiry** — Lead tracking (WALK_IN/PHONE/WEBSITE/REFERRAL/OTHER source)
**Admission** — Full lifecycle: INQUIRY → APPLIED → ADMITTED → ENROLLED → REJECTED
- All personal fields, idProof, previousSchool, target class/section
- customFieldValues (JSON), timestamps for each status transition
- Relations: guardians[], documents[], student (one-to-one on enrollment)

**AdmissionSettings** — Sequence prefixes, accepted ID proof types, custom form fields
**DocumentTypeConfig** — Configurable document types (isRequired, acceptedFormats, showInAdmission/Profile)

### 6.6 Staff & Department Models

**Staff** — serialNo, employeeNo (unique per institution), personal details, qualifications
- departmentId, primaryRoleId, reportsToId (hierarchy)
- status: ACTIVE/INACTIVE/ON_LEAVE/TERMINATED
- Relations: roles, leaves, attendance, salary, documents, class teacher assignments

**Department** — name, description, color, avatarUrl, hodId, deputyHodId, subjectNames[], status
**DeptAnnouncement** — Department-level announcements
**StaffRole** — Department roles (e.g., PRT, TGT) with permissions (JSON)
**StaffRoleAssignment** — Secondary role assignments for staff

### 6.7 Subject & LMS Models

**Subject** — Per class-section, with serialNo, code, weeklyPeriods
- LMS fields: hasOnlineContent, enrollmentType, completionTrackingEnabled
- Grade config: showGradesToStudents, allowLateSubmission
- coTeachers[], teachingAssistants[] (string arrays)
- Relations: teachers, posts, modules, discussions, resources, gradebook

**SubjectTeacher** — Links teacher to subject (isPrimary flag)

**SubjectPost** — Stream content
- type: MATERIAL/ASSIGNMENT/QUIZ/POLL/EXAM/ANNOUNCEMENT/HOMEWORK
- Relations: attachments, assignment/quiz/poll (one-to-one)

**SubjectModule → SubjectModuleItem** — Hierarchical LMS content
- Module items: LINK/TEXT/FILE/VIDEO/ASSIGNMENT/QUIZ/DISCUSSION/LIVE_CLASS/ANNOUNCEMENT
- Content dripping: dripDays, dripTrigger (ENROLLMENT/START_DATE/COMPLETION)
- Completion tracking: completionType (VIEW/SUBMIT/SCORE_MIN), estimatedMinutes
- StudentModuleItemProgress — per-student tracking (NOT_STARTED/IN_PROGRESS/COMPLETED)

**SubjectDiscussion** — Threaded discussions with replies, best answers, upvotes
**SubjectLiveClass** — Platform (ZOOM/GOOGLE_MEET/TEAMS), meetUrl, recordingUrl
**SubjectResource** — Downloadable files with download count
**SubjectAnnouncement** — With read tracking (SubjectAnnouncementRead)

### 6.8 Assessment Models

**ExamType** — e.g., Unit Test 1, Half Yearly, Annual (with weightage, order)
**ExamSchedule** — Links class/subject/examType to date/time/room
**GradeEntry** — Per student/subject/examType (marksObtained, totalMarks, gradeLetter)
**SubjectGradebookConfig** — Weightage rules, passingPercent, roundingMethod

**Assignment** — dueDate, totalMarks, maxAttempts, latePenaltyPercent, rubricId
- Group assignments (isGroupAssignment, groupSetId)
- Peer assessment and similarity checking support

**AssignmentSubmission** — Per student/attempt, with grading workflow (SUBMITTED/LATE/GRADED/RETURNED/MISSING)

**Quiz → QuizQuestion → QuizAttempt** — MCQ/MULTI_SELECT/SHORT/LONG/TRUE_FALSE, with time limits and scoring
**Poll → PollVote** — Question polls with multiple option support

**Rubric** — Assessment criteria (JSON), shared or subject-specific
**QuestionBank → QuestionBankItem** — Reusable question library with difficulty levels

**GroupSet → SubjectGroup → SubjectGroupMember** — Student grouping (RANDOM/SELF_SELECT/MANUAL)
**PeerAssessment → PeerAssessmentSubmission** — Peer review system
**SimilarityCheckResult** — Plagiarism detection scores

### 6.9 Attendance & Timetable

**AttendanceSettings** — mode: DAILY/PERIOD/BOTH
**Attendance** — Per student/section/date/period, status: PRESENT/ABSENT/LATE/HALF_DAY/EXCUSED
**StaffAttendance** — checkInTime/checkOutTime, status, notes
**TimetableSlot** — dayOfWeek, periodNumber, startTime, endTime, subjectId, staffId, roomNumber
**SubstitutionRecord** — Teacher substitution tracking with notifications

### 6.10 Fee Management

**FeeCategory** — amount, frequency (MONTHLY/QUARTERLY/HALF_YEARLY/ANNUAL/ONE_TIME)
- applicableTo (ALL/CLASS/SECTION), classYearIds[], sectionIds[]

**FeePayment** — Unique per [studentId, feeCategoryId, month, year]
- amount, fineAmount, totalAmount (decimal)
- status: PENDING/PAID/OVERDUE/WAIVED/PARTIAL
- method: CASH/UPI/CARD/CHEQUE/NEFT/RTGS/DD
- receiptNo (unique), transactionRef

**FeeConcession** — Per student, type (FIXED/PERCENTAGE), validFrom/validTill
**FeeFine** — type (FIXED/PERCENTAGE/PER_DAY), graceDays, maxAmount
**FeeReminder** — daysBeforeDue, channel, messageTemplate
**FeeSettings** — receiptPrefix, receiptCurrentSeq, lateFineEnabled, reminderEnabled, partialPaymentAllowed

### 6.11 Staff HR Models

**StaffLeaveType** — maxDaysPerYear, carryForward, isPaid
**StaffLeave** — fromDate, toDate, status (PENDING/APPROVED/REJECTED/CANCELLED), substituteStaffId
**StaffSalaryConfig** — allowanceTypes (JSON), deductionTypes (JSON)
**StaffSalary** — Monthly: basicSalary, allowances, deductions, lopDays, grossSalary, netSalary, payslipUrl
**StaffDocument / StaffIdCard** — Similar to student documents
**PerformanceNote** — rating, isPrivate, createdById
**StaffSettings** — employeeNoPrefix, employeeNoCurrentSeq, documentTypes

### 6.12 Notifications

**Notification** — type, title, body, channel (WHATSAPP/SMS/EMAIL/PUSH), status, priority
**NotificationTemplate** — Per [institutionId, type, channel], with variable substitution
**NotificationPreference** — Per user: pushEnabled, emailEnabled, smsEnabled, whatsappEnabled, mutedTypes[], quietHours
**ParentCommunicationLog** — Tracks sent messages to parents

### 6.13 Standalone Courses (LMS)

**Course** — title, description, instructorId, targetType (ALL/CLASS/SECTION), status (DRAFT/ACTIVE/ARCHIVED)
**CoursePost** — Same types as SubjectPost
**CourseAttachment** — Same structure as SubjectAttachment
**CourseEnrollment** — Per [courseId, studentId], progressPercent, completedPostIds

### 6.14 Other Models

- **HomeworkLog / HomeworkCompletion** — Homework tracking
- **LessonPlan** — Weekly lesson planning
- **PromotionRecord** — Student promotion/detention tracking
- **BehaviourIncident** — Type, severity, actionTaken, parentNotified
- **Achievement** — Category (SPORTS/CULTURAL/ACADEMIC/COMMUNITY), with photo
- **CounsellorNote** — Private student notes with follow-up dates
- **StudentNote** — Per student per module item (study notes)
- **OnboardingStep** — Tracks institution setup (classesAdded, staffAdded, studentsAdded)
- **SchoolCalendarEvent** — HOLIDAY/EXAM/EVENT/MEETING/DEADLINE
- **SupportTicket / TicketMessage** — Help desk with priority and internal messages
- **AuditLog** — userId, action, tableName, recordId, before/after (JSON)
- **SubjectCertificate** — Completion certificates
- **SubjectExportJob** — Batch export operations

### 6.15 Key Enums

**Portal & Roles:** PortalType, PlanTier, Board, InstitutionType, MasqueradeMode
**People:** Gender, BloodGroup, GuardianType, StudentStatus, StaffStatus, TransportMode, BoardingType
**Academic:** ClassYearStatus, StudentSectionStatus, PromotionStatus, AttendanceStatus, AttendanceSettingsMode
**Content:** SubjectPostType, AttachmentType, ModuleItemType, DripTrigger, CompletionType, ProgressStatus, EnrollmentMode
**Assessment:** GradeSource, QuestionType, DifficultyLevel, SubmissionStatus, RoundingMethod
**Finance:** FeeFrequency, FeeApplicable, FeePaymentStatus, PaymentMethod, FineType, ConcessionType
**HR:** LeaveStatus, StaffAttendanceStatus, SalaryStatus
**Comms:** NotificationType, NotificationChannel, NotificationStatus, NotificationPriority
**Misc:** AdmissionStatus, AdmissionType, InquirySource, IncidentType, Severity, AchievementCategory, CalendarEventType, TicketPriority, TicketStatus, DocumentType, IdProofType, ExitType, CourseStatus, CourseTargetType

---

## 7. Navigation Structure

### Management Shell (5 groups)

**Academic:** Dashboard, Classes, Timetable, Attendance, Grades, Calendar
**People:** Admissions, Students, Staff, Departments, Communications
**Finance:** Fees, Payroll
**Platform:** Courses, Vibe, Bus Tracking
**Admin:** Leave Requests, Roles, Documents, Reports, Audit Log, Support, Risk Signals, Settings

### Consumer Shell

**Parent Tabs:** Home, Bus, Fees, Grades, Chat
**Student Tabs:** Home, Subjects, Grades, Homework, Profile

### Super Admin Shell

Dashboard, Institutions, Users, Tickets, Analytics, Roles, Settings

---

## 8. Route Patterns

### Management Portal
```
/management/dashboard
/management/students                      # list
/management/students/[studentId]          # detail (cuid or serialNo)
/management/staff                          # list with tabs (directory, payroll, leaves, org-chart)
/management/staff/[staffId]               # detail
/management/staff/roles                    # staff role management
/management/staff/payroll                  # payroll management
/management/staff/leaves                   # leave requests
/management/departments                    # list
/management/departments/[deptId]          # detail
/management/institution/classes            # class list
/management/institution/classes/[classYearId]  # detail with tabs (overview, students, subjects, settings, attendance, gradebook, promote)
/management/subjects/[subjectId]          # detail with tabs (classwork, assessments, gradebook, resources, groups, settings)
/management/subjects/[subjectId]/gradebook
/management/courses                        # list
/management/courses/[courseId]             # detail
/management/admissions                     # list with status pipeline
/management/admissions/new                 # new admission form
/management/admissions/[admissionId]      # detail
/management/fees                           # fee management with tabs
/management/attendance                     # marking + reports
/management/grades                         # grade entry + reports
/management/timetable
/management/calendar
/management/documents
/management/reports
/management/audit
/management/tickets
/management/bus
/management/vibe
/management/communications
/management/risk
/management/admin/users                    # user management
/management/settings                       # settings root
/management/settings/branding
/management/settings/academics
/management/settings/admissions
/management/settings/staff
/management/settings/fees
/management/settings/notifications
/management/settings/password
/management/settings/whitelabel
```

### Consumer Portal
```
/consumer/dashboard
/consumer/subjects                         # list
/consumer/subjects/[subjectId]            # detail
/consumer/subjects/[subjectId]/quiz/[quizId]
/consumer/courses
/consumer/courses/[courseId]
/consumer/grades
/consumer/homework
/consumer/fees
/consumer/bus
/consumer/chat
/consumer/profile
/consumer/notifications
/consumer/profile/notifications
```

### Super Admin Portal
```
/super/dashboard
/super/institutions                        # list
/super/institutions/[institutionId]       # detail
/super/institutions/[institutionId]/edit
/super/institutions/[institutionId]/manage  # manage as school admin
/super/institutions/[institutionId]/manage/... (mirrors /management/*)
/super/users
/super/roles
/super/tickets
/super/analytics
/super/settings
```

### API Routes (190+)
```
/api/health
/api/auth/[...nextauth]
/api/trpc/[trpc]
/api/masquerade/start|stop|context
/api/onboarding/status|steps

/api/school/
  overview/stats|finance
  students/                               # CRUD + search/filter/paginate
  students/[studentId]/                   # detail, documents, siblings, id-card, exit
  staff/                                  # CRUD
  staff/[staffId]/                        # detail, documents, id-card
  staff/roles/                            # role CRUD + assignments
  staff/leaves/                           # leave applications
  staff/attendance/                       # staff attendance
  staff/salary/                           # payroll
  classes/                                # CRUD
  classes/[classYearId]/                  # detail, sections, students, clone, promote
  subjects/[subjectId]/                   # detail, teachers, posts, modules, gradebook, resources, groups, announcements, discussions, live-classes, certificates, export
  departments/[deptId]/                   # CRUD + announcements
  attendance/                             # mark, summary, heatmap
  fees/categories|payments|concessions|generate|settings|fines|reminders
  admissions/                             # applications, pipeline
  inquiries/
  courses/[courseId]/                      # CRUD, posts, enrollments
  calendar/events
  notifications/
  audit/
  support/tickets
  risk/
  settings/departments|exam-types|leave-types|documents|salary-config|attendance|admission

/api/student/
  grades, homework, subjects, assignments

/api/consumer/parent/
  children, grades, fees, attendance

/api/super/
  institutions/                           # CRUD + manage
  users/                                  # platform user management
  roles/                                  # platform roles
  analytics/
  audit/
  tickets/
```

---

## 9. UI Architecture

### 9.1 Layout Hierarchy

```
Root Layout (SessionProvider + ThemeProvider + Masquerade + Toaster)
├── Auth Layout (public)
├── Management Layout (sidebar 280px + theme injection + notification bell)
│   ├── Class Detail Layout (tab bar)
│   ├── Subject Detail Layout (tab bar)
│   └── Settings Layout (settings nav)
├── Consumer Layout (bottom nav 56px + theme toggle)
└── Super Layout (sidebar 280px)
```

### 9.2 Installed shadcn/ui Components (29)

button, input, label, card, dialog, alert-dialog, confirm-dialog, sheet, tabs, accordion, badge, avatar, checkbox, switch, select, popover, textarea, table, skeleton, progress, separator, alert, portal, overlay-panel, form (react-hook-form), toast, toaster

### 9.3 Shared Components

| Component | Purpose |
|---|---|
| ManagementSidebar | Desktop: fixed 280px sidebar. Mobile: Sheet drawer |
| ConsumerBottomNav | Fixed bottom nav with safe-area padding |
| SuperSidebar | Platform admin sidebar |
| NotificationBell | Unread count badge |
| ThemeInjector | Injects institution colors as CSS variables |
| MasqueradeBar | Yellow bottom bar when impersonating |
| MasqueradeFrame | Amber border ring during masquerade |
| MasqueradeReadOnlyOverlay | Blocks interactions in read-only mode |
| ErrorBoundary | Error fallback with retry |
| StatCard | Icon + label + value card |
| SkeletonCard | Loading placeholder |
| PageTransition | Animation wrapper |

### 9.4 Custom Hooks (7)

| Hook | Purpose |
|---|---|
| useTenant() | Institution context from session (id, name, subdomain, colors, logo) |
| useInstitutionId() | Extract institutionId (from session or URL for super admin) |
| usePortal() | Current portalType from session |
| useMasquerade() | Masquerade state & actions |
| useMobile() | Viewport < 768px detection |
| useOnboarding() | Institution setup status from API |
| useToast() | Sonner toast notifications |
| useConfirm() | Promise-based confirmation dialog |

### 9.5 Feature Modules (30)

Each module in `src/features/` contains components, hooks, schemas, and actions for a domain:

admin, admissions, attendance, audit, bus, calendar, classes, communications, consumer, courses, departments, documents, fees, gradebook, grades, notifications, onboarding, reports, roles, school, settings, staff, student, students, subjects, super, tickets, timetable, users, vibe

### 9.6 Theming

- **CSS Variables** in HSL format (`:root` and `.dark`)
- **Dynamic injection** via ThemeInjector (institution colors → CSS variables)
- **Dark mode** via next-themes (class-based)
- **Default colors:** Primary #C56447 (orange-red), Secondary #E6407F (pink)
- **Custom color palette generation:** hex → HSL conversion, WCAG contrast checking

### 9.7 Responsive Design

- Mobile-first (320px → sm → md → lg → xl)
- 44px minimum tap targets (constant: `MIN_TAP_TARGET`)
- Mobile breakpoint at 768px (constant: `MOBILE_BREAKPOINT`)
- Safe-area padding for notched devices
- Sidebar: hidden on mobile, Sheet drawer instead
- Consumer: bottom nav (fixed, z-30, 56px height)

---

## 10. Key Utilities (src/lib/)

| File | Purpose |
|---|---|
| prisma.ts | Singleton Prisma client (verbose logging in dev) |
| nav.ts | MANAGEMENT_NAV, PARENT_TABS, STUDENT_TABS, getAuthorisedNav() |
| permissions.ts | 67 permission constants, hasPermission/hasAny/hasAll helpers, isConsumerPortal() |
| defaultRoles.ts | Default permission bundles per portal type |
| masquerade.ts | Portal hierarchy, mode rules, cookie names |
| colors.ts | Predefined color palettes |
| colorUtils.ts | Hex/HSL conversion, palette generation, WCAG contrast |
| api-helpers.ts | getSchoolContext(req, allowedRoles), isApiError() |
| resolve-id.ts | resolveClassYearId(), resolveStudentId(), resolveStaffId() — handles cuid vs numeric serialNo |
| constants.ts | APP_NAME, MOBILE_BREAKPOINT (768), MIN_TAP_TARGET (44), RISK_THRESHOLD_* |
| notifications.ts | sendNotifications(), resolveTargetUserIds(), interpolateTemplate() |
| utils.ts | cn() — clsx + tailwind-merge |

---

## 11. Seed Data (prisma/seed.ts — 59KB)

### Demo Institution
- **St. Mary's Convent School** (subdomain: `stmarys`)
- Board: CBSE, Plan: GROWTH, primary color: blue-themed

### Users (13)
- admin@stmarys.com (ADMIN)
- teacher@stmarys.com, teacher1/2/3@stmarys.com (TEACHER)
- student@stmarys.com (STUDENT)
- parent@stmarys.com (PARENT)
- instructor@stmarys.com (INSTRUCTOR)
- super@platform.com (SUPER_ADMIN via PlatformUser)

### Academic Data
- 1 Academic Year (2024-25)
- 3 Class Templates (Class 6, 7, 8)
- 7 Sections total (Class 6: A/B, Class 7: A/B, Class 8: A/B/C)
- 25 Students with complete profiles, guardians, blood groups
- 15 Admissions across all statuses
- 5 Subjects for Class 8 (Math, Science, English, Hindi, Social Studies)
- 4 Exam Types (Unit Test 1/2, Half Yearly, Annual)
- 1 Standalone Course ("Spoken English — Beginner")

### Platform Data
- 4 Platform Roles (Super Admin, Support Agent, Billing Manager, Analyst)

### Staff Settings
- Employee prefix: EMP, starting sequence: 1004
- Salary config: HRA 20%, Transport allowance, Medical allowance, PF 12%, Professional Tax

---

## 12. Deployment

### Render Configuration (render.yaml)
- **Service:** web, Node.js, Singapore region, free plan
- **Root:** `client/`
- **Build:** `npm install && npx prisma generate && npm run build`
- **Start:** `npx prisma migrate deploy && node server.js`
- **Health:** `/api/health`
- **Database:** PostgreSQL, Singapore, free plan

### Environment Variables
```
DATABASE_URL, DIRECT_URL (Prisma)
NEXTAUTH_SECRET, NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NODE_ENV=production
```

### Next.js Config
- output: standalone (for Docker/Render)
- serverComponentsExternalPackages: @prisma/client, bcryptjs
- Image domains: Cloudinary, Google, Render
- swcMinify + compress enabled

---

## 13. Git History (Chronological — bottom to top)

```
a0d6aa6 Initial commit: Next.js 14 + Express + PostgreSQL starter with shadcn/ui
4443f5a chore: add coding standards and claude.md living context
74b86e0 refactor: restructure to Next.js-only architecture with portal route groups and Prisma schema
d7cebed feat: add login page with portal selector and redirect root to auth
78844c7 refactor: simplify login page, remove portal selector
4687f1d feat: 2-shell permission architecture with NextAuth, management/consumer shells, and feature modules
b1f269e chore: add PostgreSQL setup, Prisma v5 migration, and seed data
738408d fix: resolve route conflict by moving route groups to actual path segments
7c91cd8 feat: add users management page with search and sortable table
aa66abd feat: add super admin users page with profile view and password change
bb24cd8 style: polish admin users table and user profile pages
1e39bee feat: implement masquerade mode for admins
f2682f9 feat(super-admin): implement super admin portal and institutions management UI
5ace444 feat: add management nav restructure, dedicated pages, whitelabel, and UI polish
5b2ca9d Added all required fields
bcd5466 big update — implemented almost all features
19fd1dd fix(staff): UX audit — fix 11 interaction and usability issues
b3b98e0 feat(fees): implement complete fees module with categories, payments, concessions
0cfb814 chore: render deployment config, mobile UX fixes, roles redesign
3541593 fix: move autoprefixer to dependencies for render build
7bae9ca class and subject changes
2b0e78b message to fix the class structure
20222e9 new class module
```

---

## 14. What's Built (Status)

| Area | Status | Notes |
|---|---|---|
| Foundation | Done | Next.js 14, TypeScript strict, Tailwind, shadcn |
| Auth | Done | NextAuth v5, Credentials, JWT, 6 portal types |
| Database | Done | 63+ models, 28+ enums, multi-tenant |
| 3-Shell Layout | Done | Management (sidebar), Consumer (bottom nav), Super (sidebar) |
| Navigation | Done | Permission-filtered nav for all 3 shells |
| Masquerade | Done | Read-only + full-access modes |
| Students | Done | List, detail, documents, ID cards, guardians, siblings, exit |
| Staff | Done | List, detail, roles, leaves, attendance, salary, documents |
| Classes | Done | List, detail, sections, students, subjects, promote, clone |
| Subjects | Done | Detail with classwork, assessments, gradebook, resources, groups |
| Fees | Done | Categories, payments, concessions, fines, reminders, settings |
| Admissions | Done | Inquiry → Application → Enrollment pipeline |
| Departments | Done | CRUD, HOD, announcements |
| Attendance | Done | Daily marking, summary, heatmap |
| Grades | Done | Entry, reporting |
| Calendar | Done | Event management |
| Settings | Done | Branding, academics, admissions, staff, fees, notifications, password |
| Super Admin | Done | Institutions CRUD, manage-as-school, users, roles |
| Courses (LMS) | Done | CRUD, posts, enrollments |
| API Routes | Done | 190+ REST endpoints |
| Notifications | Partial | Models + templates exist, delivery not wired |
| Seed Data | Done | Full demo school with 25 students, 13 users |
| Deployment | Done | Render config, standalone build |
| tRPC | Skeleton | Router defined but empty — REST routes used instead |
| Services Layer | Placeholder | Folders exist, not extracted from routes yet |
| Repositories | Placeholder | Folders exist, not extracted yet |
| Tests | Not started | Vitest configured but no tests written |
| Vibe (Community) | Not started | Route exists, feature not built |
| Bus Tracking | Not started | Route exists, feature not built |
| Communications | Not started | Route exists, feature not built |
| Reports | Partial | Route exists, basic dashboard |
| AI Features | Not started | Permissions defined, no implementation |
| Timetable | Partial | Route exists, model exists, basic UI |

---

## 15. What's Next (Planned)

### Week 2 — Auth Deepening
- Portal-specific route guards (teachers can't access admin routes)
- Custom role permission checks from database (beyond defaults)
- Role management UI completion

### Future Phases (not yet scheduled)
- Service/Repository layer extraction from API routes
- tRPC migration (move from REST to tRPC procedures)
- Vibe (community feed) feature
- Bus tracking integration
- Communications (WhatsApp, SMS, email sending)
- AI features (lesson plans, insights)
- Full notification delivery pipeline
- Test suite (Vitest + Testing Library)
- PWA capabilities
- Python AI service (Phase 10)

---

## 16. Architecture Rules (Non-Negotiable)

1. **RULE-001:** No `any` TypeScript types
2. **RULE-002:** Always include `institutionId` in DB queries
3. **RULE-003:** Never query DB from components
4. **RULE-004:** No secrets in Git
5. **RULE-005:** service/repository pattern always (route → service → repository)
6. **RULE-006:** Mobile first — 44px minimum tap targets
7. **RULE-007:** UX audit every UI change (behavioral science, cognitive psychology, accessibility)
8. **RULE-008:** URL routing conventions (path segments, never query params for IDs)

---

## 17. UX Design Principles

- **Behavioral Science:** Minimize cognitive load, prevent decision fatigue, respect mental models
- **Economic Thinking:** Every element must earn its place; prefer removing over adding
- **Accessibility:** WCAG AA contrast, 14px min body text, 44px tap targets, keyboard navigable
- **Mobile-First:** Design for 320px first, then scale up
- **Visual Hierarchy:** Minimal, clean, structured — one primary action per view
- **Flow Optimization:** Reduce friction, minimize steps, immediate feedback

---

## 18. Key Design Decisions

| Decision | Rationale |
|---|---|
| Monorepo (client only) | Simplicity — no separate server needed with Next.js API routes |
| REST routes (not tRPC yet) | Speed of development — tRPC migration planned |
| JWT (not DB sessions) | Performance — no session lookups on every request |
| Credentials only (no OAuth) | School context — email/password fits the use case |
| serialNo on core models | URL-friendly numeric IDs alongside cuid primary keys |
| CSS variable theming | Dynamic institution branding without rebuilds |
| Feature modules | Domain-driven organization for 30+ feature areas |
| shadcn/ui (not Material/Ant) | Composable, unstyled primitives for maximum customization |
| Subdomain multi-tenancy | Clean tenant isolation without URL prefix clutter |
| Render deployment | Free tier, Singapore region, PostgreSQL included |

---

*End of context. Use this document to plan features, design architecture, ideate on roadmap, or onboard new team members.*
