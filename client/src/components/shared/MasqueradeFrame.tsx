'use client'

import { useMasquerade } from '@/hooks/useMasquerade'

export function MasqueradeFrame() {
    const { active } = useMasquerade()

    if (!active) return null

    return (
        <div
            className="fixed inset-0 z-[9998] pointer-events-none ring-4 ring-inset ring-amber-400"
        />
    )
}
