'use client'

import {
  Globe, CheckCircle2, Clock, AlertTriangle,
  Calendar, Users, GraduationCap, Ticket,
} from 'lucide-react'
import { PLAN_COLORS } from '@/lib/colors'
import { formatDistanceToNow } from 'date-fns'

interface OnboardingStatus {
  classesAdded: boolean
  staffAdded: boolean
  studentsAdded: boolean
  completedAt: string | null
}

interface Props {
  institution: {
    name: string
    subdomain: string
    institutionType: string
    board: string
    planTier: string
    primaryColor: string
    logoUrl: string | null
    isActive: boolean
    city: string | null
    state: string | null
    createdAt: string
    onboarding: OnboardingStatus | null
    _count: { users: number; students: number }
  }
  openTickets: number
}

function OnboardingBadge({
  onboarding,
}: {
  onboarding: OnboardingStatus | null
}) {
  if (!onboarding) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1
        rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Clock className="h-3 w-3" />
        Not started
      </span>
    )
  }
  if (onboarding.completedAt) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1
        rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Setup complete
      </span>
    )
  }
  const completed = [
    onboarding.classesAdded,
    onboarding.staffAdded,
    onboarding.studentsAdded,
  ].filter(Boolean).length
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1
      rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <AlertTriangle className="h-3 w-3" />
      Setup {completed}/3
    </span>
  )
}

export function SchoolHero({ institution, openTickets }: Props) {
  const accountAge = formatDistanceToNow(
    new Date(institution.createdAt),
    { addSuffix: false }
  )

  const initials = institution.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col lg:flex-row lg:items-start
      lg:justify-between gap-6">

      {/* Left — Identity */}
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {institution.logoUrl ? (
            <img
              src={institution.logoUrl}
              alt={institution.name}
              className="h-16 w-16 rounded-xl object-cover border"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-xl flex items-center
                justify-center text-white text-xl font-bold"
              style={{ backgroundColor: institution.primaryColor }}
            >
              {initials}
            </div>
          )}
          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4
              rounded-full border-2 border-background
              ${institution.isActive ? 'bg-green-500' : 'bg-red-500'}`}
          />
        </div>

        <div className="space-y-2 min-w-0">
          <div>
            <h1 className="text-2xl font-bold leading-tight truncate">
              {institution.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {institution.institutionType.replace('_', ' ')}
              {' · '}{institution.board}
              {institution.city && institution.state
                ? ` · ${institution.city}, ${institution.state}`
                : ''
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1
              px-2.5 py-1 rounded-full text-xs font-medium
              bg-muted text-muted-foreground">
              <Globe className="h-3 w-3" />
              {institution.subdomain}.onflows.app
            </span>
            <span className={`inline-flex items-center px-2.5 py-1
              rounded-full text-xs font-medium
              ${PLAN_COLORS[institution.planTier] ??
                'bg-gray-100 text-gray-600'}`}>
              {institution.planTier}
            </span>
            <OnboardingBadge onboarding={institution.onboarding} />
          </div>

          <div className="flex flex-wrap items-center gap-4
            text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {accountAge} ago
            </span>
          </div>
        </div>
      </div>

      {/* Right — Quick Stats */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-center">
          <p className="text-2xl font-bold">
            {institution._count.users}
          </p>
          <p className="text-xs text-muted-foreground
            flex items-center gap-1 justify-center">
            <Users className="h-3 w-3" />
            Users
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">
            {institution._count.students}
          </p>
          <p className="text-xs text-muted-foreground
            flex items-center gap-1 justify-center">
            <GraduationCap className="h-3 w-3" />
            Students
          </p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold
            ${openTickets > 0 ? 'text-red-600' : ''}`}>
            {openTickets}
          </p>
          <p className="text-xs text-muted-foreground
            flex items-center gap-1 justify-center">
            <Ticket className="h-3 w-3" />
            Tickets
          </p>
        </div>
      </div>
    </div>
  )
}
