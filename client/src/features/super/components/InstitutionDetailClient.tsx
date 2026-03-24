'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    suspendInstitution,
    reactivateInstitution,
    updateInstitutionPlan,
} from '@/features/super/actions/institutionActions'
import type { Institution } from '@/features/super/types'
import { InstitutionOverviewTab } from './InstitutionOverviewTab'
import { InstitutionUsersTab } from './InstitutionUsersTab'
import { InstitutionBillingTab } from './InstitutionBillingTab'

const ticketStatusColor: Record<string, string> = {
    OPEN: 'destructive',
    IN_PROGRESS: 'default',
    RESOLVED: 'secondary',
    CLOSED: 'outline',
}

const priorityColor: Record<string, string> = {
    CRITICAL: 'destructive',
    HIGH: 'default',
    MEDIUM: 'secondary',
    LOW: 'outline',
}

export function InstitutionDetailClient({ institution }: { institution: Institution }) {
    const [isPending, startTransition] = useTransition()

    function handlePlanChange(plan: 'STARTER' | 'GROWTH' | 'PRO') {
        startTransition(async () => {
            await updateInstitutionPlan(institution.id, plan)
        })
    }

    function handleStatusToggle() {
        startTransition(async () => {
            if (institution.isActive) {
                await suspendInstitution(institution.id, 'Suspended by platform admin')
            } else {
                await reactivateInstitution(institution.id)
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link href="/super/institutions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Institutions
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">{institution.name}</h1>
                        <Badge variant="outline">{institution.subdomain}</Badge>
                        <Badge variant="secondary">{institution.planTier}</Badge>
                        <Badge variant={institution.isActive ? 'default' : 'destructive'}>
                            {institution.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                    </div>
                    {institution.suspendedReason && (
                        <p className="text-sm text-destructive">Reason: {institution.suspendedReason}</p>
                    )}
                </div>
                <Button
                    variant={institution.isActive ? 'destructive' : 'default'}
                    size="sm"
                    disabled={isPending}
                    onClick={handleStatusToggle}
                >
                    {institution.isActive ? 'Suspend School' : 'Reactivate School'}
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users ({institution._count.users})</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets ({institution.tickets.length})</TabsTrigger>
                    <TabsTrigger value="audit">Audit Log</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <InstitutionOverviewTab institution={institution} />
                </TabsContent>

                <TabsContent value="users">
                    <InstitutionUsersTab users={institution.users} />
                </TabsContent>

                <TabsContent value="billing">
                    <InstitutionBillingTab
                        institution={institution}
                        isPending={isPending}
                        onPlanChange={handlePlanChange}
                    />
                </TabsContent>

                {/* Tickets */}
                <TabsContent value="tickets" className="mt-4">
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institution.tickets.map((ticket) => (
                                    <tr key={ticket.id} className="border-b last:border-0">
                                        <td className="px-4 py-3 font-medium">{ticket.title}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={(priorityColor[ticket.priority] as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'secondary'}>
                                                {ticket.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={(ticketStatusColor[ticket.status] as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'secondary'}>
                                                {ticket.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {institution.tickets.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No tickets</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* Audit Log */}
                <TabsContent value="audit" className="mt-4">
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Table</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Record</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institution.auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b last:border-0">
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{log.action}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{log.tableName}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.recordId.slice(0, 8)}…</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {institution.auditLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No audit logs</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
