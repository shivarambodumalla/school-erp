export type PortalType = 'admin' | 'teacher' | 'student' | 'parent' | 'instructor'

export interface SessionUser {
    id: string
    email: string
    portalType: PortalType
    institutionId: string
}
