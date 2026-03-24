'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canMasqueradeAs } from '@/lib/masquerade'

interface Props {
    targetUserId: string
    targetEmail: string
    targetPortalType: string
    initiatorPortalType: string
}

export function MasqueradeButton({
    targetUserId,
    targetEmail,
    targetPortalType,
    initiatorPortalType,
}: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Hide button if cannot masquerade
    if (!canMasqueradeAs(initiatorPortalType, targetPortalType)) {
        return null
    }

    async function handleMasquerade() {
        setLoading(true)
        setError('')

        const res = await fetch('/api/masquerade/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: targetUserId }),
        })

        const data = (await res.json()) as { success?: boolean; error?: string }

        if (!res.ok || !data.success) {
            setError(data.error ?? 'Failed to start masquerade')
            setLoading(false)
            return
        }

        // Open dashboard in new tab as target user
        window.open('/dashboard', '_blank')
        setLoading(false)
    }

    return (
        <div className="space-y-1">
            <Button
                onClick={handleMasquerade}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
                <Eye className="h-4 w-4" />
                {loading ? 'Starting...' : `View as ${targetEmail.split('@')[0]}`}
            </Button>
            {error ? (
                <p className="text-xs text-red-600">{error}</p>
            ) : null}
        </div>
    )
}
