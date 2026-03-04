import type { ReactNode } from 'react'

export default function InstructorLayout({ children }: { children: ReactNode }): JSX.Element {
    return <div className="min-h-screen">{children}</div>
}
