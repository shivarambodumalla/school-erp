'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface User {
    id: string
    email: string
    portalType: string
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
}

interface UsersTableProps {
    users: User[]
}

type SortField = 'email' | 'portalType' | 'createdAt' | 'lastLoginAt'
type SortDir = 'asc' | 'desc'

const PORTAL_BADGE_COLORS: Record<string, string> = {
    ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    TEACHER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    STUDENT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    PARENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    INSTRUCTOR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

function formatDate(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function SortIcon({ field, sortField, sortDir }: {
    field: SortField
    sortField: SortField
    sortDir: SortDir
}): JSX.Element {
    if (sortField !== field) {
        return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />
    }
    if (sortDir === 'asc') {
        return <ArrowUp className="h-3.5 w-3.5 ml-1" />
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1" />
}

export function UsersTable({ users }: UsersTableProps): JSX.Element {
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('createdAt')
    const [sortDir, setSortDir] = useState<SortDir>('desc')

    function handleSort(field: SortField): void {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()
        return users.filter(u =>
            u.email.toLowerCase().includes(q) ||
            u.portalType.toLowerCase().includes(q)
        )
    }, [users, search])

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const aVal = a[sortField] ?? ''
            const bVal = b[sortField] ?? ''
            const result = String(aVal).localeCompare(String(bVal))
            return sortDir === 'asc' ? result : -result
        })
    }, [filtered, sortField, sortDir])

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by email or role..."
                    value={search}
                    onChange={(e): void => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Count */}
            <p className="text-sm text-muted-foreground">
                Showing {sorted.length} of {users.length} users
            </p>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={(): void => handleSort('email')}
                            >
                                <span className="flex items-center">
                                    Email <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={(): void => handleSort('portalType')}
                            >
                                <span className="flex items-center">
                                    Role <SortIcon field="portalType" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={(): void => handleSort('lastLoginAt')}
                            >
                                <span className="flex items-center">
                                    Last Login <SortIcon field="lastLoginAt" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={(): void => handleSort('createdAt')}
                            >
                                <span className="flex items-center">
                                    Created <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground py-12"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            sorted.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5
                      rounded-full text-xs font-medium
                      ${PORTAL_BADGE_COLORS[user.portalType] ??
                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {user.portalType}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5
                      rounded-full text-xs font-medium
                      ${user.isActive
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(user.lastLoginAt)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(user.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
