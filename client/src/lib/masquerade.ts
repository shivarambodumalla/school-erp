// ── Portal Hierarchy — lower number = higher rank ──────────────
export const PORTAL_HIERARCHY: Record<string, number> = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    TEACHER: 3,
    INSTRUCTOR: 3,
    STUDENT: 4,
    PARENT: 4,
}

// Who can initiate masquerade
export const CAN_MASQUERADE = ['SUPER_ADMIN', 'ADMIN']

// Default masquerade mode per portal type
export const DEFAULT_MASQUERADE_MODE: Record<string, 'READ_ONLY' | 'FULL_ACCESS'> = {
    SUPER_ADMIN: 'FULL_ACCESS',
    ADMIN: 'READ_ONLY',
}

export function canMasqueradeAs(
    initiatorPortalType: string,
    targetPortalType: string,
): boolean {
    if (!CAN_MASQUERADE.includes(initiatorPortalType)) return false

    const initiatorLevel = PORTAL_HIERARCHY[initiatorPortalType] ?? 99
    const targetLevel = PORTAL_HIERARCHY[targetPortalType] ?? 99

    return initiatorLevel < targetLevel
}

// Cookie names
export const MASQUERADE_COOKIE = 'masquerade_as'
export const MASQUERADE_MODE_COOKIE = 'masquerade_mode'
export const MASQUERADE_INITIATOR_COOKIE = 'masquerade_initiator'
