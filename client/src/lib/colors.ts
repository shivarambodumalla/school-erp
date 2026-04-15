// Role badge colors
export const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-indigo-100 text-indigo-700',
    STUDENT: 'bg-violet-100 text-violet-700',
    PARENT: 'bg-emerald-100 text-emerald-700',
    INSTRUCTOR: 'bg-amber-100 text-amber-700',
    SUPER_ADMIN: 'bg-red-100 text-red-700',
}

// Plan tier badge colors
export const PLAN_COLORS: Record<string, string> = {
    STARTER: 'bg-gray-100 text-gray-600',
    GROWTH: 'bg-blue-100 text-blue-600',
    PRO: 'bg-purple-100 text-purple-600',
}

// Generic status badge colors (lowercase keys for legacy)
export const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    suspended: 'bg-orange-100 text-orange-700',
}

// ── Domain-specific status colors ──

export const STAFF_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700',
    TERMINATED: 'bg-red-100 text-red-700',
}

export const CLASS_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-gray-100 text-gray-600',
    DRAFT: 'bg-amber-100 text-amber-700',
}

export const COURSE_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-gray-100 text-gray-600',
    DRAFT: 'bg-amber-100 text-amber-700',
}

export const FEE_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    WAIVED: 'bg-gray-100 text-gray-600',
    PARTIAL: 'bg-blue-100 text-blue-700',
}

export const ADMISSION_STATUS_COLORS: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-700',
    ADMITTED: 'bg-emerald-100 text-emerald-700',
    ENROLLED: 'bg-violet-100 text-violet-700',
    REJECTED: 'bg-red-100 text-red-700',
}

export const STUDENT_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-red-100 text-red-700',
    TRANSFERRED: 'bg-amber-100 text-amber-700',
}

export const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PROMOTED: 'bg-blue-100 text-blue-700',
    DETAINED: 'bg-red-100 text-red-700',
    TRANSFERRED: 'bg-gray-100 text-gray-600',
}

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
    PRESENT: 'bg-green-500',
    ABSENT: 'bg-red-500',
    LATE: 'bg-amber-500',
    HALF_DAY: 'bg-blue-500',
    EXCUSED: 'bg-gray-400',
}

export const STAFF_ATTENDANCE_COLORS: Record<string, string> = {
    PRESENT: 'bg-green-500',
    ABSENT: 'bg-red-500',
    HALF_DAY: 'bg-amber-500',
    ON_LEAVE: 'bg-blue-500',
    HOLIDAY: 'bg-purple-500',
    LATE: 'bg-orange-500',
}

export const LEAVE_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const LEAVE_PILL_COLORS: Record<string, string> = {
    ALL: 'bg-primary text-primary-foreground',
    PENDING: 'bg-amber-600 text-white',
    APPROVED: 'bg-green-600 text-white',
    REJECTED: 'bg-red-600 text-white',
    CANCELLED: 'bg-gray-500 text-white',
}

export const COURSE_PROGRESS_COLORS: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    NOT_STARTED: 'bg-muted text-muted-foreground',
}

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-blue-100 text-blue-700',
    SUBMITTED: 'bg-green-100 text-green-700',
    GRADED: 'bg-violet-100 text-violet-700',
    OVERDUE: 'bg-red-100 text-red-700',
}

// Ticket priority colors
export const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-600',
    MEDIUM: 'bg-blue-100 text-blue-600',
    HIGH: 'bg-orange-100 text-orange-600',
    CRITICAL: 'bg-red-100 text-red-700',
}

// Ticket status colors
export const TICKET_STATUS_COLORS: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
}

// Audit action colors
export const AUDIT_ACTION_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
    PASSWORD_CHANGED: 'bg-amber-100 text-amber-700',
    MASQUERADE_START: 'bg-purple-100 text-purple-700',
    MASQUERADE_STOP: 'bg-gray-100 text-gray-600',
    THEME_UPDATED: 'bg-violet-100 text-violet-700',
}

// Masquerade mode colors
export const MASQUERADE_MODE_COLORS: Record<string, string> = {
    FULL_ACCESS: 'bg-green-100 text-green-700',
    READ_ONLY: 'bg-amber-100 text-amber-700',
    DISABLED: 'bg-gray-100 text-gray-600',
}

/**
 * Generate a vivid HSL color from a name string.
 * Uses a simple hash (djb2) for good distribution — similar names get distinct colors.
 * Deterministic — same name always produces the same color.
 * Returns an `hsl(...)` string for use in inline `style`.
 */
export function generateColor(name: string): string {
    let hash = 5381
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) + hash + name.charCodeAt(i)) | 0
    }
    const hue = ((hash % 360) + 360) % 360
    return `hsl(${hue}, 75%, 75%)`
}

/**
 * Get initials from first and last name (max 2 chars).
 */
export function getInitials(firstName: string, lastName: string): string {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

// Legacy — kept for AdminUsersTable portal-type colors (not name-based)
export const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
]

/** @deprecated Use generateColor() instead */
export function getAvatarColor(name: string): string {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length
    return AVATAR_COLORS[index] ?? 'bg-gray-500'
}
