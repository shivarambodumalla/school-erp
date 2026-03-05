import type { DefaultSession } from 'next-auth'
import type { Permission } from '@/lib/permissions'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            portalType: string
            institutionId: string
            institutionName: string
            institutionSubdomain: string
            primaryColor: string
            logoUrl?: string
            permissions: Permission[]
        } & DefaultSession['user']
    }

    interface User {
        portalType: string
        institutionId: string
        institutionName: string
        institutionSubdomain: string
        primaryColor: string
        logoUrl?: string
        permissions: Permission[]
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        portalType: string
        institutionId: string
        institutionName: string
        institutionSubdomain: string
        primaryColor: string
        logoUrl?: string
        permissions: Permission[]
    }
}
