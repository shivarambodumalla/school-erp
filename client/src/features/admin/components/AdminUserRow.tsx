'use client'

import { TableRow, TableCell } from '@/components/ui/table'
import { ChevronRight } from 'lucide-react'
import { ROLE_COLORS, PLAN_COLORS, generateColor } from '@/lib/colors'

export interface Institution {
    id: string
    name: string
    subdomain: string
    board: string
    planTier: string
}

export interface User {
    id: string
    email: string
    portalType: string
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
    institution: Institution
}

function getInitials(email: string): string {
    const name = email.split('@')[0] ?? ''
    return name.substring(0, 2).toUpperCase()
}

function formatDate(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

interface AdminUserRowProps {
    user: User
    onClick: () => void
}

export function AdminUserRow({ user, onClick }: AdminUserRowProps): JSX.Element {
    return (
        <TableRow
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onClick}
        >
            <TableCell>
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: generateColor(user.email) }}
                    >
                        <span className="text-gray-800 text-xs font-semibold">
                            {getInitials(user.email)}
                        </span>
                    </div>
                    <span className="font-medium text-sm truncate">{user.email}</span>
                </div>
            </TableCell>
            <TableCell>
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.portalType] ?? ''}`}
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
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[user.institution.planTier] ?? ''}`}
                >
                    {user.institution.planTier}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1.5">
                    <span
                        className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
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
}
