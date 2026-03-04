"use client"

import { usePathname } from 'next/navigation'

type PortalType = 'admin' | 'teacher' | 'student' | 'parent' | 'instructor' | null

export function usePortal(): PortalType {
    const pathname = usePathname()

    if (pathname.startsWith('/admin')) return 'admin'
    if (pathname.startsWith('/teacher')) return 'teacher'
    if (pathname.startsWith('/student')) return 'student'
    if (pathname.startsWith('/parent')) return 'parent'
    if (pathname.startsWith('/instructor')) return 'instructor'

    return null
}
