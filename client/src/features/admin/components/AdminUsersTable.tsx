'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Search, ArrowUpDown, ArrowUp,
    ArrowDown, ChevronRight,
} from 'lucide-react'

interface Institution {
    id: string
    name: string
    subdomain: string
    board: string
    planTier: string
}

interface User {
    id: string
    email: string
    portalType: string
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
    institution: Institution
}

interface AdminUsersTableProps {
    users: User[]
}

type SortField = 'email' | 'portalType' | 'institution' | 'createdAt' | 'lastLoginAt'
type SortDir = 'asc' | 'desc'

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
    ADMIN: { bg: '#DBEAFE', text: '#1D4ED8' },
    TEACHER: { bg: '#E0E7FF', text: '#4338CA' },
    STUDENT: { bg: '#EDE9FE', text: '#6D28D9' },
    PARENT: { bg: '#D1FAE5', text: '#047857' },
    INSTRUCTOR: { bg: '#FEF3C7', text: '#B45309' },
}

const PLAN_STYLES: Record<string, { bg: string; text: string }> = {
    STARTER: { bg: '#F3F4F6', text: '#4B5563' },
    GROWTH: { bg: '#DBEAFE', text: '#1D4ED8' },
    PRO: { bg: '#EDE9FE', text: '#7C3AED' },
}

function formatDate(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

function getInitials(email: string): string {
    const name = email.split('@')[0] ?? ''
    return name.substring(0, 2).toUpperCase()
}

const AVATAR_COLORS: Record<string, string> = {
    ADMIN: '#3B82F6',
    TEACHER: '#6366F1',
    STUDENT: '#8B5CF6',
    PARENT: '#10B981',
    INSTRUCTOR: '#F59E0B',
}

function SortIcon({ field, sortField, sortDir }: {
    field: SortField
    sortField: SortField
    sortDir: SortDir
}): JSX.Element {
    if (sortField !== field) {
        return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-30" />
    }
    if (sortDir === 'asc') {
        return <ArrowUp className="h-3.5 w-3.5 ml-1" />
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1" />
}

export function AdminUsersTable({ users }: AdminUsersTableProps): JSX.Element {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('createdAt')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [roleFilter, setRoleFilter] = useState<string>('ALL')

    function handleSort(field: SortField): void {
        if (sortField === field) {
            setSortDir(p => p === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()
        return users.filter(u => {
            const matchSearch =
                u.email.toLowerCase().includes(q) ||
                u.institution.name.toLowerCase().includes(q) ||
                u.portalType.toLowerCase().includes(q) ||
                u.institution.subdomain.toLowerCase().includes(q)
            const matchRole =
                roleFilter === 'ALL' || u.portalType === roleFilter
            return matchSearch && matchRole
        })
    }, [users, search, roleFilter])

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let aVal = ''
            let bVal = ''
            if (sortField === 'institution') {
                aVal = a.institution.name
                bVal = b.institution.name
            } else {
                aVal = a[sortField] ?? ''
                bVal = b[sortField] ?? ''
            }
            const result = String(aVal).localeCompare(String(bVal))
            return sortDir === 'asc' ? result : -result
        })
    }, [filtered, sortField, sortDir])

    const roles = ['ALL', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'INSTRUCTOR']

    return (
        <div className="space-y-5">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email, school or role..."
                        value={search}
                        onChange={(e): void => setSearch(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {roles.map(role => {
                        const isActive = roleFilter === role
                        const roleStyle = role !== 'ALL' ? ROLE_STYLES[role] : null
                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={(): void => setRoleFilter(role)}
                                style={isActive && roleStyle ? {
                                    backgroundColor: roleStyle.bg,
                                    color: roleStyle.text,
                                    borderColor: roleStyle.text + '40',
                                } : undefined}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                    ${isActive && !roleStyle
                                        ? 'bg-foreground text-background border-foreground'
                                        : !isActive
                                            ? 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                                            : ''
                                    }`}
                            >
                                {role}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Count */}
            <p className="text-sm text-muted-foreground">
                Showing {sorted.length} of {users.length} users
            </p>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="cursor-pointer select-none w-[280px]" onClick={(): void => handleSort('email')}>
                                <span className="flex items-center font-semibold text-xs uppercase tracking-wider">
                                    User <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={(): void => handleSort('portalType')}>
                                <span className="flex items-center font-semibold text-xs uppercase tracking-wider">
                                    Role <SortIcon field="portalType" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={(): void => handleSort('institution')}>
                                <span className="flex items-center font-semibold text-xs uppercase tracking-wider">
                                    Institution <SortIcon field="institution" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead>
                                <span className="font-semibold text-xs uppercase tracking-wider">Plan</span>
                            </TableHead>
                            <TableHead>
                                <span className="font-semibold text-xs uppercase tracking-wider">Status</span>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={(): void => handleSort('lastLoginAt')}>
                                <span className="flex items-center font-semibold text-xs uppercase tracking-wider">
                                    Last Login <SortIcon field="lastLoginAt" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={(): void => handleSort('createdAt')}>
                                <span className="flex items-center font-semibold text-xs uppercase tracking-wider">
                                    Created <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead className="w-8" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-16">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p className="text-sm">No users found</p>
                                        <p className="text-xs">Try adjusting your search or filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sorted.map(user => {
                                const roleStyle = ROLE_STYLES[user.portalType]
                                const planStyle = PLAN_STYLES[user.institution.planTier]
                                const avatarBg = AVATAR_COLORS[user.portalType] ?? '#6B7280'
                                return (
                                    <TableRow
                                        key={user.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={(): void => router.push(`/management/admin/users/${user.id}`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: avatarBg }}
                                                >
                                                    <span className="text-white text-xs font-semibold">
                                                        {getInitials(user.email)}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-sm truncate">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={roleStyle ? {
                                                    backgroundColor: roleStyle.bg,
                                                    color: roleStyle.text,
                                                } : undefined}
                                            >
                                                {user.portalType}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{user.institution.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.institution.subdomain}.app</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={planStyle ? {
                                                    backgroundColor: planStyle.bg,
                                                    color: planStyle.text,
                                                } : undefined}
                                            >
                                                {user.institution.planTier}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: user.isActive ? '#10B981' : '#EF4444' }}
                                                />
                                                <span className="text-sm">
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(user.lastLoginAt)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(user.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
