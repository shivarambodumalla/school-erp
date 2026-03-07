'use client'

import { useMasquerade } from '@/hooks/useMasquerade'
import { useEffect } from 'react'

export function MasqueradeReadOnlyOverlay() {
    const { active, mode } = useMasquerade()

    useEffect(() => {
        if (active && mode === 'READ_ONLY') {
            const style = document.createElement('style')
            style.id = 'masquerade-readonly'
            style.textContent = `
                button:not([data-masquerade-stop]),
                input,
                select,
                textarea,
                [role="button"]:not([data-masquerade-stop]) {
                    pointer-events: none !important;
                    opacity: 0.6 !important;
                }
            `
            document.head.appendChild(style)
        }

        return () => {
            document.getElementById('masquerade-readonly')?.remove()
        }
    }, [active, mode])

    return null
}
