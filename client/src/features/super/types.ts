export interface User {
    id: string
    email: string
    portalType: string
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
}

export interface Ticket {
    id: string
    title: string
    status: string
    priority: string
    createdAt: Date
}

export interface AuditEntry {
    id: string
    action: string
    tableName: string
    recordId: string
    createdAt: Date
    userId: string
}

export interface OnboardingStep {
    classesAdded: boolean
    staffAdded: boolean
    studentsAdded: boolean
    completedAt: Date | null
}

export interface Institution {
    id: string
    name: string
    subdomain: string
    board: string
    planTier: string
    isActive: boolean
    suspendedAt: Date | null
    suspendedReason: string | null
    billingEmail: string | null
    customPricing: string | null
    createdAt: Date
    onboarding: OnboardingStep | null
    _count: { students: number; users: number }
    users: User[]
    tickets: Ticket[]
    auditLogs: AuditEntry[]
}
