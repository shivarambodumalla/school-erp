'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OverlayPanelProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A right-side slide-over panel rendered via portal to avoid
 * z-index / overflow clipping issues from parent containers.
 */
export function OverlayPanel({ title, onClose, children }: OverlayPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md
        bg-background border-l shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">{children}</div>
      </div>
    </>,
    document.body,
  )
}
