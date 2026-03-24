'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, ShieldCheck, Users } from 'lucide-react'
import { createPlatformRole, deletePlatformRole } from '@/features/super/actions/platformActions'

interface Role {
    id: string
    name: string
    description: string | null
    permissions: unknown
    masqueradeMode: string
    isSystemRole: boolean
    createdAt: Date
    _count: { users: number }
}

interface Props {
    roles: Role[]
}

const MASQ_COLOR: Record<string, string> = {
    FULL_ACCESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    READ_ONLY: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    DISABLED: 'bg-muted text-muted-foreground',
}

const PLATFORM_PERMISSIONS = [
    { group: 'Institutions', items: [{ key: 'platform.institutions.view', label: 'View' }, { key: 'platform.institutions.manage', label: 'Manage' }] },
    { group: 'Billing', items: [{ key: 'platform.billing.view', label: 'View' }, { key: 'platform.billing.manage', label: 'Manage' }] },
    { group: 'Analytics', items: [{ key: 'platform.analytics.view', label: 'View' }] },
    { group: 'Tickets', items: [{ key: 'platform.tickets.view', label: 'View' }, { key: 'platform.tickets.resolve', label: 'Resolve' }] },
    { group: 'Settings', items: [{ key: 'platform.settings.manage', label: 'Manage' }] },
    { group: 'Roles', items: [{ key: 'platform.roles.manage', label: 'Manage' }] },
    { group: 'Users', items: [{ key: 'platform.users.manage', label: 'Manage' }] },
    { group: 'Masquerade', items: [{ key: 'platform.masquerade', label: 'Enable' }] },
]

export function PlatformRolesClient({ roles }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [masqueradeMode, setMasqueradeMode] = useState<'DISABLED' | 'READ_ONLY' | 'FULL_ACCESS'>('DISABLED')
    const [selectedPerms, setSelectedPerms] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()

    function togglePerm(key: string) {
        setSelectedPerms((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key])
    }

    function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            await createPlatformRole({ name, description: description || undefined, masqueradeMode, permissions: selectedPerms })
            setName('')
            setDescription('')
            setMasqueradeMode('DISABLED')
            setSelectedPerms([])
            setShowForm(false)
        })
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            await deletePlatformRole(id)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Platform Roles</h1>
                    <p className="text-muted-foreground text-sm mt-1">{roles.length} roles defined</p>
                </div>
                <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Create Role
                </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => {
                    const perms = Array.isArray(role.permissions) ? role.permissions as string[] : []
                    return (
                        <div key={role.id} className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{role.name}</p>
                                        {role.isSystemRole && (
                                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">System</span>
                                        )}
                                    </div>
                                    {role.description && <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MASQ_COLOR[role.masqueradeMode]}`}>
                                    {role.masqueradeMode.replace('_', ' ')}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />{role._count.users} users
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    <ShieldCheck className="h-3 w-3 mr-1" />{perms.length} perms
                                </Badge>
                            </div>

                            {!role.isSystemRole && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive w-full"
                                    onClick={() => handleDelete(role.id)}
                                    disabled={isPending}
                                >
                                    Delete Role
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-background rounded-xl border w-full max-w-lg p-6 space-y-4 my-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Create Platform Role</h2>
                            <button onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Role Name</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Masquerade Mode</Label>
                                <select
                                    value={masqueradeMode}
                                    onChange={(e) => setMasqueradeMode(e.target.value as typeof masqueradeMode)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="DISABLED">Disabled</option>
                                    <option value="READ_ONLY">Read Only</option>
                                    <option value="FULL_ACCESS">Full Access</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                {PLATFORM_PERMISSIONS.map((group) => (
                                    <div key={group.group}>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{group.group}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.items.map((item) => (
                                                <label key={item.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPerms.includes(item.key)}
                                                        onChange={() => togglePerm(item.key)}
                                                        className="rounded"
                                                    />
                                                    {item.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>{isPending ? 'Creating…' : 'Create Role'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
