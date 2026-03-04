import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }): JSX.Element {
    return <div className="min-h-screen">{children}</div>
}
