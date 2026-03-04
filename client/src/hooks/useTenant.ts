"use client"

import { useEffect, useState } from 'react'

interface TenantInfo {
    institutionId: string | null
    subdomain: string | null
}

export function useTenant(): TenantInfo {
    const [tenant, setTenant] = useState<TenantInfo>({
        institutionId: null,
        subdomain: null,
    })

    useEffect(() => {
        const hostname = window.location.hostname
        const parts = hostname.split('.')
        if (parts.length > 1) {
            setTenant({
                institutionId: null,
                subdomain: parts[0],
            })
        }
    }, [])

    return tenant
}
