'use client'

import { useSession } from 'next-auth/react'
import {
    hasPermission,
    hasAnyPermission,
    isConsumerPortal,
    type Permission,
} from '@/lib/permissions'

interface PortalInfo {
    portalType: string
    isManagement: boolean
    isConsumer: boolean
    isAdmin: boolean
    isTeacher: boolean
    isStudent: boolean
    isParent: boolean
    isInstructor: boolean
    permissions: Permission[]
    can: (permission: Permission) => boolean
    canAny: (perms: Permission[]) => boolean
}

export function usePortal(): PortalInfo {
    const { data: session } = useSession()
    const permissions = session?.user.permissions ?? []
    const portalType = session?.user.portalType ?? ''

    return {
        portalType,
        isManagement: !isConsumerPortal(portalType),
        isConsumer: isConsumerPortal(portalType),
        isAdmin: portalType === 'ADMIN',
        isTeacher: portalType === 'TEACHER',
        isStudent: portalType === 'STUDENT',
        isParent: portalType === 'PARENT',
        isInstructor: portalType === 'INSTRUCTOR',
        permissions,
        can: (permission: Permission): boolean => hasPermission(permissions, permission),
        canAny: (perms: Permission[]): boolean => hasAnyPermission(permissions, perms),
    }
}
