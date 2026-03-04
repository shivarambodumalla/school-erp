import type { ReactNode } from 'react'

export default function ParentLayout({ children }: { children: ReactNode }): JSX.Element {
    return <div className="min-h-screen">{children}</div>
}
