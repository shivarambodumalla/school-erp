// ── Feature Permission Flags ──────────────────────────────────
export const PERMISSIONS = {
    // Fees
    FEES_VIEW: 'fees.view',
    FEES_COLLECT: 'fees.collect',
    FEES_WAIVE: 'fees.waive',
    FEES_REPORT: 'fees.report',

    // Attendance
    ATTENDANCE_VIEW: 'attendance.view',
    ATTENDANCE_MARK: 'attendance.mark',
    ATTENDANCE_REPORT: 'attendance.report',

    // Students
    STUDENTS_VIEW: 'students.view',
    STUDENTS_CREATE: 'students.create',
    STUDENTS_EDIT: 'students.edit',
    STUDENTS_DELETE: 'students.delete',

    // Staff
    STAFF_VIEW: 'staff.view',
    STAFF_MANAGE: 'staff.manage',

    // Grades
    GRADES_VIEW: 'grades.view',
    GRADES_ENTER: 'grades.enter',
    GRADES_REPORT: 'grades.report',

    // Timetable
    TIMETABLE_VIEW: 'timetable.view',
    TIMETABLE_MANAGE: 'timetable.manage',

    // Courses (LMS)
    COURSES_VIEW: 'courses.view',
    COURSES_ENROLL: 'courses.enroll',
    COURSES_CREATE: 'courses.create',
    COURSES_MANAGE: 'courses.manage',

    // Vibe (community feed)
    VIBE_VIEW: 'vibe.view',
    VIBE_POST: 'vibe.post',
    VIBE_MODERATE: 'vibe.moderate',

    // Reports
    REPORTS_VIEW: 'reports.view',
    REPORTS_EXPORT: 'reports.export',

    // Settings
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_MANAGE: 'settings.manage',

    // Roles
    ROLES_VIEW: 'roles.view',
    ROLES_MANAGE: 'roles.manage',

    // GPS / Bus
    BUS_VIEW: 'bus.view',
    BUS_MANAGE: 'bus.manage',

    // AI Features
    AI_INSIGHTS: 'ai.insights',
    AI_LESSON_PLAN: 'ai.lesson_plan',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// ── Default Role Permission Bundles ───────────────────────────
// Schools can create custom roles — these are the defaults
// Parent and Student permissions are fixed (not customisable)

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    // Management shell roles
    SUPER_ADMIN: Object.values(PERMISSIONS),

    ADMIN: [
        PERMISSIONS.FEES_VIEW, PERMISSIONS.FEES_COLLECT,
        PERMISSIONS.FEES_WAIVE, PERMISSIONS.FEES_REPORT,
        PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_REPORT,
        PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.STUDENTS_CREATE,
        PERMISSIONS.STUDENTS_EDIT, PERMISSIONS.STUDENTS_DELETE,
        PERMISSIONS.STAFF_VIEW, PERMISSIONS.STAFF_MANAGE,
        PERMISSIONS.GRADES_VIEW, PERMISSIONS.GRADES_REPORT,
        PERMISSIONS.TIMETABLE_VIEW, PERMISSIONS.TIMETABLE_MANAGE,
        PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_MANAGE,
        PERMISSIONS.VIBE_VIEW, PERMISSIONS.VIBE_POST, PERMISSIONS.VIBE_MODERATE,
        PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
        PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE,
        PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_MANAGE,
        PERMISSIONS.BUS_VIEW, PERMISSIONS.BUS_MANAGE,
        PERMISSIONS.AI_INSIGHTS, PERMISSIONS.AI_LESSON_PLAN,
    ],

    TEACHER: [
        PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_MARK,
        PERMISSIONS.ATTENDANCE_REPORT,
        PERMISSIONS.STUDENTS_VIEW,
        PERMISSIONS.GRADES_VIEW, PERMISSIONS.GRADES_ENTER,
        PERMISSIONS.TIMETABLE_VIEW,
        PERMISSIONS.COURSES_VIEW,
        PERMISSIONS.VIBE_VIEW, PERMISSIONS.VIBE_POST,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.AI_INSIGHTS, PERMISSIONS.AI_LESSON_PLAN,
    ],

    INSTRUCTOR: [
        PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_CREATE,
        PERMISSIONS.COURSES_MANAGE,
        PERMISSIONS.STUDENTS_VIEW,
        PERMISSIONS.VIBE_VIEW, PERMISSIONS.VIBE_POST,
        PERMISSIONS.REPORTS_VIEW,
    ],

    // Consumer shell roles (fixed — not customisable by school)
    PARENT: [
        PERMISSIONS.FEES_VIEW,
        PERMISSIONS.ATTENDANCE_VIEW,
        PERMISSIONS.GRADES_VIEW,
        PERMISSIONS.TIMETABLE_VIEW,
        PERMISSIONS.VIBE_VIEW,
        PERMISSIONS.BUS_VIEW,
        PERMISSIONS.COURSES_VIEW,
    ],

    STUDENT: [
        PERMISSIONS.FEES_VIEW,
        PERMISSIONS.ATTENDANCE_VIEW,
        PERMISSIONS.GRADES_VIEW,
        PERMISSIONS.TIMETABLE_VIEW,
        PERMISSIONS.VIBE_VIEW, PERMISSIONS.VIBE_POST,
        PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_ENROLL,
    ],
}

// ── Shell Assignment ───────────────────────────────────────────
// Which shell does each portal type use?
export const CONSUMER_PORTAL_TYPES = ['PARENT', 'STUDENT'] as const
export type ConsumerPortalType = typeof CONSUMER_PORTAL_TYPES[number]

export function isConsumerPortal(portalType: string): boolean {
    return CONSUMER_PORTAL_TYPES.includes(portalType as ConsumerPortalType)
}

// ── Permission Helpers ─────────────────────────────────────────
export function hasPermission(
    userPermissions: Permission[],
    required: Permission
): boolean {
    return userPermissions.includes(required)
}

export function hasAnyPermission(
    userPermissions: Permission[],
    required: Permission[]
): boolean {
    return required.some(p => userPermissions.includes(p))
}

export function hasAllPermissions(
    userPermissions: Permission[],
    required: Permission[]
): boolean {
    return required.every(p => userPermissions.includes(p))
}
