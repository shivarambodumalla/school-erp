'use client'

import { useMasquerade } from '@/hooks/useMasquerade'
import { Eye, X } from 'lucide-react'

export function MasqueradeBar() {
    const { active, mode, targetUser, loading, stop } = useMasquerade()

    if (loading || !active || !targetUser) return null

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[9999]
                flex items-center justify-between gap-4
                px-4 py-3 text-sm font-medium bg-amber-400 text-stone-900"
        >
            <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 shrink-0" />
                <span>
                    Viewing as{' '}
                    <strong>{targetUser.email}</strong>
                    {' '}({targetUser.portalType})
                    {' · '}
                    <span className="opacity-80">
                        {mode === 'READ_ONLY' ? 'Read Only' : 'Full Access'}
                    </span>
                </span>
            </div>
            <button
                data-masquerade-stop
                onClick={stop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                    text-xs font-semibold transition-colors bg-black/20 hover:bg-black/30"
            >
                <X className="h-3.5 w-3.5" />
                Stop Masquerade
            </button>
        </div>
    )
}
