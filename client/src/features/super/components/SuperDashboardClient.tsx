'use client'

import { Building2, CheckCircle, Users, GraduationCap, Ticket } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SuperStatCard } from './SuperStatCard'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Stats {
    institutionCount: number
    userCount: number
    studentCount: number
    activeCount: number
    openTickets: number
}

interface RecentInstitution {
    id: string
    name: string
    subdomain: string
    planTier: string
    isActive: boolean
    createdAt: Date
    _count: { students: number; users: number }
}

interface PlanCount {
    planTier: string
    _count: number
}

interface Props {
    stats: Stats
    recentInstitutions: RecentInstitution[]
    planBreakdown: PlanCount[]
}

const planColors: Record<string, string> = {
    STARTER: 'secondary',
    GROWTH: 'default',
    PRO: 'outline',
}

export function SuperDashboardClient({ stats, recentInstitutions, planBreakdown }: Props) {
    const chartData = planBreakdown.map((p) => ({
        name: p.planTier,
        schools: p._count,
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Platform Overview</h1>
                <p className="text-muted-foreground text-sm mt-1">All schools on the platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <SuperStatCard label="Total Schools" value={stats.institutionCount} icon={Building2} color="blue" />
                <SuperStatCard label="Active Schools" value={stats.activeCount} icon={CheckCircle} color="green" />
                <SuperStatCard label="Total Users" value={stats.userCount} icon={Users} color="violet" />
                <SuperStatCard label="Total Students" value={stats.studentCount} icon={GraduationCap} color="amber" />
                <SuperStatCard label="Open Tickets" value={stats.openTickets} icon={Ticket} color="red" />
            </div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Institutions */}
                <div className="lg:col-span-2 rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Recent Schools</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">School</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Students</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Users</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentInstitutions.map((inst) => (
                                    <tr key={inst.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/super/institutions/${inst.id}`} className="hover:underline">
                                                <p className="font-medium">{inst.name}</p>
                                                <p className="text-xs text-muted-foreground">{inst.subdomain}</p>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={(planColors[inst.planTier] as 'default' | 'secondary' | 'outline') ?? 'secondary'}>
                                                {inst.planTier}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right hidden sm:table-cell">{inst._count.students}</td>
                                        <td className="px-4 py-3 text-right hidden sm:table-cell">{inst._count.users}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={inst.isActive ? 'default' : 'destructive'}>
                                                {inst.isActive ? 'Active' : 'Suspended'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentInstitutions.length === 0 && (
                            <p className="text-center text-muted-foreground py-8 text-sm">No institutions yet</p>
                        )}
                    </div>
                </div>

                {/* Plan Breakdown */}
                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Plan Breakdown</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {planBreakdown.map((p) => (
                            <div key={p.planTier} className="flex items-center justify-between">
                                <span className="text-sm font-medium">{p.planTier}</span>
                                <span className="text-sm text-muted-foreground">{p._count} schools</span>
                            </div>
                        ))}
                        <div className="h-40 mt-4 min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="schools" fill="hsl(var(--primary))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
