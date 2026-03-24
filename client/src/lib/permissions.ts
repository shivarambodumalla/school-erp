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

    // Masquerade
    MASQUERADE_READ_ONLY: 'masquerade.read_only',
    MASQUERADE_FULL_ACCESS: 'masquerade.full_access',

    // Audit
    AUDIT_VIEW: 'audit.view',

    // Documents
    DOCUMENTS_VIEW: 'documents.view',
    DOCUMENTS_UPLOAD: 'documents.upload',

    // Calendar
    CALENDAR_VIEW: 'calendar.view',
    CALENDAR_MANAGE: 'calendar.manage',

    // Tickets
    TICKETS_VIEW: 'tickets.view',
    TICKETS_MANAGE: 'tickets.manage',

    // Communications
    COMMUNICATIONS_VIEW: 'communications.view',

    // Platform (Super Admin only)
    PLATFORM_ADMIN: 'platform.admin',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

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
