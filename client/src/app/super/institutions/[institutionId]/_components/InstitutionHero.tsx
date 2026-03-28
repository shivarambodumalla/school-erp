'use client'

import { useState } from 'react'
import {
  Globe, Edit, ShieldCheck, CheckCircle2,
  Clock, AlertTriangle, Calendar, Users,
  GraduationCap, Ticket,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { PLAN_COLORS } from '@/lib/colors'
import { formatDistanceToNow } from 'date-fns'
import { EditInstitutionDrawer } from './EditInstitutionDrawer'

interface OnboardingStatus {
  classesAdded: boolean
  staffAdded: boolean
  studentsAdded: boolean
  completedAt: string | null
}

interface LastActivity {
  lastLoginAt: string | null
  email: string
  portalType: string
}

interface Institution {
  id: string
  name: string
  subdomain: string
  institutionType: string
  board: string
  planTier: string
  primaryColor: string
  secondaryColor: string | null
  logoUrl: string | null
  isActive: boolean
  suspendedAt: string | null
  suspendedReason: string | null
  createdAt: string
  city: string | null
  state: string | null
  phone: string | null
  website: string | null
  themePalette: unknown
  themeAppliedAt: string | null
  onboarding: OnboardingStatus | null
  _count: { users: number; students: number }
}

interface EditableInstitution {
  id: string
  name: string
  subdomain: string
  institutionType: string
  board: string
  planTier: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pinCode: string | null
  phone: string | null
  website: string | null
  establishedYear: number | null
  studentCapacity: number | null
  billingEmail: string | null
}

interface Props {
  institution: Institution
  editData: EditableInstitution
  lastActivity: LastActivity | null
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

export function InstitutionHero({
  institution,
  editData,
  lastActivity,
  openTickets,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const accountAge = formatDistanceToNow(
    new Date(institution.createdAt),
    { addSuffix: false }
  )
  const lastSeen = lastActivity?.lastLoginAt
    ? formatDistanceToNow(
        new Date(lastActivity.lastLoginAt),
        { addSuffix: true }
      )
    : 'Never'

  const initials = institution.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  async function handleMasqueradeAsAdmin() {
    const res = await fetch(
      `/api/super/institutions/${institution.id}/admin-user`
    )
    const data = await res.json() as { userId?: string }
    if (data.userId) {
      const result = await fetch('/api/masquerade/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.userId }),
      })
      if (result.ok) {
        window.open('/dashboard', '_blank')
      }
    }
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start
        lg:justify-between gap-6">

        {/* Left — Identity */}
        <div className="flex items-start gap-4">
          {/* Logo / initials */}
          <div className="relative shrink-0">
            {institution.logoUrl ? (
              <Image
                src={institution.logoUrl}
                alt={institution.name}
                width={64}
                height={64}
                className="rounded-xl object-cover border"
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
            {/* Status dot */}
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4
                rounded-full border-2 border-background
                ${institution.isActive
                  ? 'bg-green-500'
                  : 'bg-red-500'
                }`}
            />
          </div>

          {/* Info */}
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

            {/* Badges */}
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
              <span className={`inline-flex items-center px-2.5 py-1
                rounded-full text-xs font-medium
                ${institution.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                {institution.isActive ? 'Active' : 'Suspended'}
              </span>
              <OnboardingBadge onboarding={institution.onboarding} />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4
              text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {accountAge} ago
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last active {lastSeen}
                {lastActivity && (
                  <span className="ml-1 opacity-70">
                    ({lastActivity.portalType.toLowerCase()})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right — Stats + Actions */}
        <div className="flex flex-col gap-4 lg:items-end shrink-0">
          {/* Quick stats */}
          <div className="flex items-center gap-6">
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

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  process.env.NODE_ENV === 'production'
                    ? `https://${institution.subdomain}.onflows.app`
                    : `http://${institution.subdomain}.localhost:3000`,
                  '_blank'
                )
              }
            >
              <Globe className="h-4 w-4 mr-1.5" />
              Open Site
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMasqueradeAsAdmin}
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              Masquerade as Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <EditInstitutionDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        institution={editData}
      />
    </div>
  )
}
