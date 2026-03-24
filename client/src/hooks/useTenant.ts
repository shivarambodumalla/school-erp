'use client'

import { useSession } from 'next-auth/react'

interface TenantInfo {
    institutionId: string
    institutionName: string
    subdomain: string
    primaryColor: string
    logoUrl: string | undefined
}

export function useTenant(): TenantInfo {
    const { data: session } = useSession()
    return {
        institutionId: session?.user.institutionId ?? '',
        institutionName: session?.user.institutionName ?? '',
        subdomain: session?.user.institutionSubdomain ?? '',
        primaryColor: session?.user.primaryColor ?? 'hsl(221 83% 53%)',
        logoUrl: session?.user.logoUrl,
    }
}
