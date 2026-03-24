'use client'

import { Badge } from '@/components/ui/badge'
import type { User } from '@/features/super/types'

export function InstitutionUsersTab({ users }: { users: User[] }) {
    return (
        <div className="rounded-xl border bg-card overflow-hidden mt-4">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0">
                            <td className="px-4 py-3 font-medium">{user.email}</td>
                            <td className="px-4 py-3">
                                <Badge variant="secondary">{user.portalType}</Badge>
                            </td>
                            <td className="px-4 py-3">
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
