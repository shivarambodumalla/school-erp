'use client'

import {
  Users, GraduationCap, BookOpen,
  Ticket, CreditCard,
} from 'lucide-react'

import type { OverviewStats, InstitutionDetails } from './types'

interface Props {
  stats: OverviewStats
  institution: InstitutionDetails
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  sub?: string
  subColor?: string
}

function Card({
  label, value, icon: Icon,
  iconBg, iconColor, sub, subColor,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm
      hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground
            uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold mt-1 leading-none">
            {value}
          </p>
          {sub && (
            <p className={`text-xs mt-1.5 font-medium ${subColor ?? 'text-muted-foreground'}`}>
              {sub}
            </p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center
          justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

export function OverviewStatsRow({ stats, institution }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5
      gap-4">
      <Card
        label="Total Users"
        value={String(stats.userCount)}
        icon={Users}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        sub="All portal types"
      />
      <Card
        label="Students"
        value={String(stats.studentCount)}
        icon={GraduationCap}
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
        sub="Enrolled"
      />
      <Card
        label="Classes"
        value={String(stats.classCount)}
        icon={BookOpen}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        sub="Active classes"
      />
      <Card
        label="Open Tickets"
        value={String(stats.openTickets)}
        icon={Ticket}
        iconBg={stats.openTickets > 0
          ? 'bg-red-100' : 'bg-green-100'}
        iconColor={stats.openTickets > 0
          ? 'text-red-600' : 'text-green-600'}
        sub={stats.openTickets > 0
          ? 'Needs attention' : 'All resolved'}
        subColor={stats.openTickets > 0
          ? 'text-red-600' : 'text-green-600'}
      />
      <Card
        label="Plan"
        value={institution.planTier}
        icon={CreditCard}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        sub={institution.isActive ? 'Active' : 'Suspended'}
        subColor={institution.isActive
          ? 'text-green-600' : 'text-red-600'}
      />
    </div>
  )
}
