"use client"

import type { ReactNode } from 'react'

interface PageTransitionProps {
    children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps): JSX.Element {
    return <div>{children}</div>
}
