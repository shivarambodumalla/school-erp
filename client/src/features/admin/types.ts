export interface AdminInstitution {
    id: string
    name: string
    subdomain: string
    board: string
    planTier: string
    primaryColor: string
    createdAt: string
}

export interface AdminUser {
    id: string
    email: string
    portalType: string
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
    institution: AdminInstitution
}

export interface UserProfileProps {
    user: AdminUser
    initiatorPortalType: string
}

export interface ResultState {
    type: 'success' | 'error'
    message: string
}
