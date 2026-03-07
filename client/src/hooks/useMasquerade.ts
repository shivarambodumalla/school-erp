'use client'

import { useEffect, useState } from 'react'

interface MasqueradeContext {
    active: boolean
    mode: 'READ_ONLY' | 'FULL_ACCESS'
    targetUser: {
        id: string
        email: string
        portalType: string
        institutionName: string
    } | null
}

const DEFAULT: MasqueradeContext = {
    active: false,
    mode: 'READ_ONLY',
    targetUser: null,
}

export function useMasquerade() {
    const [context, setContext] = useState<MasqueradeContext>(DEFAULT)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/masquerade/context')
            .then(r => r.json())
            .then(data => {
                setContext(data as MasqueradeContext)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    async function stop() {
        await fetch('/api/masquerade/stop', { method: 'POST' })
        window.close()
    }

    return { ...context, loading, stop }
}
