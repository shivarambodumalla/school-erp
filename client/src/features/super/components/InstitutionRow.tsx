'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { suspendInstitution, reactivateInstitution } from '@/features/super/actions/institutionActions'

export interface Institution {
    id: string
    name: string
    subdomain: string
    board: string
    planTier: string
    isActive: boolean
    suspendedAt: Date | null
    createdAt: Date
    billingEmail: string | null
    _count: { students: number; users: number }
}

function StatusToggleButton({ id, isActive }: { id: string; isActive: boolean }) {
    const [isPending, startTransition] = useTransition()

    function handleToggle() {
        startTransition(async () => {
            if (isActive) {
                await suspendInstitution(id, 'Suspended by platform admin')
            } else {
                await reactivateInstitution(id)
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleToggle}
            className={isActive ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-700'}
        >
            {isPending ? '...' : isActive ? 'Suspend' : 'Reactivate'}
        </Button>
    )
}

interface InstitutionRowProps {
    institution: Institution
}

export function InstitutionRow({ institution: inst }: InstitutionRowProps) {
    return (
        <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3">
                <Link href={`/super/institutions/${inst.id}`} className="hover:underline">
                    <p className="font-medium">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">{inst.subdomain}</p>
                </Link>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{inst.board}</td>
            <td className="px-4 py-3">
                <Badge variant="secondary">{inst.planTier}</Badge>
            </td>
            <td className="px-4 py-3 text-right">{inst._count.students}</td>
            <td className="px-4 py-3 text-right">{inst._count.users}</td>
            <td className="px-4 py-3">
                <Badge variant={inst.isActive ? 'default' : 'destructive'}>
                    {inst.isActive ? 'Active' : 'Suspended'}
                </Badge>
            </td>
            <td className="px-4 py-3 text-muted-foreground text-xs" suppressHydrationWarning>
                {new Date(inst.createdAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <Link href={`/super/institutions/${inst.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                    </Link>
                    <StatusToggleButton id={inst.id} isActive={inst.isActive} />
                </div>
            </td>
        </tr>
    )
}
