'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import { createPlatformUser, deactivatePlatformUser, changePlatformUserRole } from '@/features/super/actions/platformActions'

interface PlatformUser {
    id: string
    email: string
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
    platformRole: { id: string; name: string }
}

interface Props {
    users: PlatformUser[]
    roles: { id: string; name: string }[]
}

export function PlatformUsersClient({ users, roles }: Props) {
    const [showInvite, setShowInvite] = useState(false)
    const [email, setEmail] = useState('')
    const [roleId, setRoleId] = useState(roles[0]?.id ?? '')
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleInvite(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            const result = await createPlatformUser(email, roleId)
            setSuccessMsg(`User invited. Temp password: ${result.tempPassword}`)
            setEmail('')
            setShowInvite(false)
        })
    }

    function handleDeactivate(id: string) {
        startTransition(async () => {
            await deactivatePlatformUser(id)
        })
    }

    function handleRoleChange(userId: string, newRoleId: string) {
        startTransition(async () => {
            await changePlatformUserRole(userId, newRoleId)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Platform Team</h1>
                    <p className="text-muted-foreground text-sm mt-1">{users.length} platform users</p>
                </div>
                <Button size="sm" onClick={() => setShowInvite(true)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Invite User
                </Button>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-3 text-sm text-green-800 dark:text-green-200 flex items-center justify-between">
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg(null)}><X className="h-4 w-4" /></button>
                </div>
            )}

            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={user.platformRole.id}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={isPending}
                                            className="h-8 rounded border border-input bg-background px-2 text-xs"
                                        >
                                            {roles.map((r) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.isActive && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDeactivate(user.id)}
                                                disabled={isPending}
                                            >
                                                Deactivate
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showInvite && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl border w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Invite Platform User</h2>
                            <button onClick={() => setShowInvite(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Role</Label>
                                <select
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                A secure temporary password will be generated. Share it with the user after creation.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>{isPending ? 'Inviting…' : 'Send Invite'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
