'use client'

import { useMasquerade } from '@/hooks/useMasquerade'

export function MasqueradeFrame() {
    const { active } = useMasquerade()

    if (!active) return null

    return (
        <div
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
                boxShadow: 'inset 0 0 0 3px #f59e0b',
            }}
        />
    )
}
