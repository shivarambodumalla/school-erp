'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders children into document.body via React portal.
 * Use this to escape overflow/transform clipping on parent containers
 * for fixed-position overlays, modals, and slide-over panels.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
