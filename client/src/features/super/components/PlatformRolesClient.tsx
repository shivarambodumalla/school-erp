'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Plus, ShieldCheck, Users, MoreHorizontal,
  Trash2,
} from 'lucide-react'
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
    { group: 'Institutions', items: [{ key: 'platform.institutions.view', label: 'View Institutions' }, { key: 'platform.institutions.manage', label: 'Manage Institutions' }] },
    { group: 'Billing', items: [{ key: 'platform.billing.view', label: 'View Billing' }, { key: 'platform.billing.manage', label: 'Manage Billing' }] },
    { group: 'Analytics', items: [{ key: 'platform.analytics.view', label: 'View Analytics' }] },
    { group: 'Tickets', items: [{ key: 'platform.tickets.view', label: 'View Tickets' }, { key: 'platform.tickets.resolve', label: 'Resolve Tickets' }] },
    { group: 'Settings', items: [{ key: 'platform.settings.manage', label: 'Manage Settings' }] },
    { group: 'Roles', items: [{ key: 'platform.roles.manage', label: 'Manage Roles' }] },
    { group: 'Users', items: [{ key: 'platform.users.manage', label: 'Manage Users' }] },
    { group: 'Masquerade', items: [{ key: 'platform.masquerade', label: 'Enable Masquerade' }] },
]

const ALL_PERM_KEYS = PLATFORM_PERMISSIONS.flatMap((g) => g.items.map((i) => i.key))

function getPerms(role: Role): string[] {
    return Array.isArray(role.permissions) ? role.permissions as string[] : []
}

export function PlatformRolesClient({ roles }: Props) {
    const confirm = useConfirm()
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [masqueradeMode, setMasqueradeMode] = useState<'DISABLED' | 'READ_ONLY' | 'FULL_ACCESS'>('DISABLED')
    const [selectedPerms, setSelectedPerms] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()

    // View drawer
    const [viewRole, setViewRole] = useState<Role | null>(null)
    const [viewOpen, setViewOpen] = useState(false)

    // Card menu
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

    function togglePerm(key: string) {
        setSelectedPerms((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key])
    }

    function resetForm() {
        setName('')
        setDescription('')
        setMasqueradeMode('DISABLED')
        setSelectedPerms([])
    }

    function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            await createPlatformRole({ name, description: description || undefined, masqueradeMode, permissions: selectedPerms })
            resetForm()
            setShowForm(false)
        })
    }

    async function handleDelete(role: Role) {
        const ok = await confirm({
            title: 'Delete Role',
            description: `Delete role "${role.name}"?`,
            note: 'This action cannot be undone.',
            destructive: true,
            confirmLabel: 'Delete',
        })
        if (!ok) return
        startTransition(async () => {
            await deletePlatformRole(role.id)
            setViewOpen(false)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Platform Roles</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {roles.length} role{roles.length !== 1 ? 's' : ''} defined
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-1.5">
                    <Plus className="h-4 w-4" /> Create Role
                </Button>
            </div>

            {roles.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center space-y-2">
                    <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="font-medium">No roles yet</p>
                    <p className="text-sm text-muted-foreground">Create your first platform role to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => {
                        const perms = getPerms(role)
                        const granted = perms.length
                        const total = ALL_PERM_KEYS.length
                        return (
                            <div
                                key={role.id}
                                className="rounded-xl border bg-card p-5 flex flex-col gap-3
                                  cursor-pointer hover:shadow-md transition-all group"
                                onClick={() => { setViewRole(role); setViewOpen(true) }}
                            >
                                {/* Header: icon + name + badges + more menu */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                                        <h3 className="font-semibold truncate">{role.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {role.isSystemRole && (
                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                                System
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="gap-1">
                                            <Users className="h-3 w-3" />
                                            {role._count.users}
                                        </Badge>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setMenuOpenId(menuOpenId === role.id ? null : role.id)
                                                }}
                                                className="h-8 w-8 flex items-center justify-center rounded-md
                                                  text-muted-foreground hover:text-foreground hover:bg-muted
                                                  transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                aria-label="More options"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                            {menuOpenId === role.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(null) }}
                                                    />
                                                    <div className="absolute right-0 top-full mt-1 z-50 w-40
                                                      rounded-lg border bg-popover shadow-md py-1">
                                                        {!role.isSystemRole && (
                                                            <button
                                                                type="button"
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm
                                                                  text-destructive hover:bg-muted transition-colors min-h-[44px]"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setMenuOpenId(null)
                                                                    handleDelete(role)
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {role.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {role.description}
                                    </p>
                                )}

                                {/* Permission summary */}
                                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                                    <span>{granted} Granted</span>
                                    <span>{total - granted} None</span>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${MASQ_COLOR[role.masqueradeMode]}`}>
                                        {role.masqueradeMode.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── View role drawer ── */}
            <Sheet open={viewOpen} onOpenChange={(isOpen) => { if (!isOpen) setViewOpen(false) }}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                    {viewRole && (() => {
                        const perms = getPerms(viewRole)
                        const granted = perms.length
                        const total = ALL_PERM_KEYS.length
                        return (
                            <>
                                <SheetHeader className="p-6 pb-4 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary
                                          flex items-center justify-center shrink-0">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <SheetTitle className="truncate">{viewRole.name}</SheetTitle>
                                            <SheetDescription className="mt-0.5">
                                                {viewRole.isSystemRole ? 'System role' : 'Custom role'}
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="p-6 space-y-6">
                                    {/* Meta badges */}
                                    <div className="flex flex-wrap gap-2">
                                        {viewRole.isSystemRole && (
                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                                System
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="gap-1">
                                            <Users className="h-3 w-3" />
                                            {viewRole._count.users} users assigned
                                        </Badge>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MASQ_COLOR[viewRole.masqueradeMode]}`}>
                                            Masquerade: {viewRole.masqueradeMode.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {viewRole.description && (
                                        <p className="text-sm text-muted-foreground">{viewRole.description}</p>
                                    )}

                                    {/* Permission summary stats */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border p-3 text-center">
                                            <p className="text-lg font-bold text-green-600">{granted}</p>
                                            <p className="text-xs text-muted-foreground">Granted</p>
                                        </div>
                                        <div className="rounded-lg border p-3 text-center">
                                            <p className="text-lg font-bold text-muted-foreground">{total - granted}</p>
                                            <p className="text-xs text-muted-foreground">None</p>
                                        </div>
                                    </div>

                                    {/* Permission details — only granted */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold">
                                            Permissions ({granted} granted)
                                        </h3>
                                        {granted === 0 ? (
                                            <p className="text-sm text-muted-foreground py-4 text-center">
                                                No permissions assigned
                                            </p>
                                        ) : PLATFORM_PERMISSIONS.map((group) => {
                                            const grantedItems = group.items.filter((item) => perms.includes(item.key))
                                            if (grantedItems.length === 0) return null
                                            return (
                                                <div key={group.group} className="space-y-1.5">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        {group.group}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {grantedItems.map((item) => (
                                                            <div
                                                                key={item.key}
                                                                className="flex items-center justify-between py-1.5 px-2
                                                                  rounded-md hover:bg-muted/50 text-sm"
                                                            >
                                                                <span>{item.label}</span>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                                                >
                                                                    Granted
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Sticky footer actions */}
                                <div className="sticky bottom-0 border-t bg-background p-4 flex items-center gap-2">
                                    {!viewRole.isSystemRole && (
                                        <Button
                                            variant="outline"
                                            className="flex-1 gap-1.5 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(viewRole)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
                                    )}
                                </div>
                            </>
                        )
                    })()}
                </SheetContent>
            </Sheet>

            {/* ── Create role drawer ── */}
            <Sheet open={showForm} onOpenChange={(isOpen) => { if (!isOpen) setShowForm(false); else resetForm() }}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Create Platform Role</SheetTitle>
                        <SheetDescription>
                            Define a new role with specific platform permissions.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleCreate} className="mt-6 space-y-5">
                        <div className="space-y-1.5">
                            <Label>Role Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Support Agent"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What this role is for..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Masquerade Mode</Label>
                            <select
                                value={masqueradeMode}
                                onChange={(e) => setMasqueradeMode(e.target.value as typeof masqueradeMode)}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="DISABLED">Disabled</option>
                                <option value="READ_ONLY">Read Only</option>
                                <option value="FULL_ACCESS">Full Access</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            {PLATFORM_PERMISSIONS.map((group) => (
                                <div key={group.group}>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                                        {group.group}
                                    </p>
                                    <div className="space-y-1">
                                        {group.items.map((item) => (
                                            <label
                                                key={item.key}
                                                className="flex items-center gap-2.5 px-2 py-2 rounded-md
                                                  hover:bg-muted/50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPerms.includes(item.key)}
                                                    onChange={() => togglePerm(item.key)}
                                                    className="rounded h-4 w-4"
                                                />
                                                <span className="text-sm">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Creating...' : 'Create Role'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    )
}
