import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const [
      institution,
      userCount,
      studentCount,
      classCount,
      openTickets,
      userBreakdown,
      onboarding,
      riskData,
      recentLogins,
    ] = await Promise.all([
      prisma.institution.findUnique({
        where: { id: institutionId },
        select: {
          id: true,
          name: true,
          subdomain: true,
          board: true,
          planTier: true,
          primaryColor: true,
          city: true,
          state: true,
          phone: true,
          website: true,
          createdAt: true,
          isActive: true,
          institutionType: true,
        },
      }),
      prisma.user.count({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId } }),
      prisma.class.count({ where: { institutionId } }),
      prisma.supportTicket.count({
        where: { institutionId, status: 'OPEN' },
      }),
      prisma.user.groupBy({
        by: ['portalType'],
        where: { institutionId },
        _count: true,
      }),
      prisma.onboardingStep.findUnique({
        where: { institutionId },
        select: {
          classesAdded: true,
          staffAdded: true,
          studentsAdded: true,
          completedAt: true,
        },
      }),
      prisma.user.findFirst({
        where: {
          institutionId,
          lastLoginAt: { not: null },
        },
        orderBy: { lastLoginAt: 'desc' },
        select: { lastLoginAt: true },
      }),
      prisma.user.findMany({
        where: {
          institutionId,
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { lastLoginAt: true },
        take: 500,
      }),
    ])

    // Build 7-day login activity array
    const today = new Date()
    const loginActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      })
      const count = recentLogins.filter(u => {
        if (!u.lastLoginAt) return false
        const loginDate = new Date(u.lastLoginAt)
        return (
          loginDate.getDate() === date.getDate() &&
          loginDate.getMonth() === date.getMonth() &&
          loginDate.getFullYear() === date.getFullYear()
        )
      }).length
      return { date: dateStr, logins: count }
    })

    // Risk signals
    const signals: {
      type: string
      severity: 'critical' | 'warning'
      title: string
    }[] = []

    const daysSinceLogin = riskData?.lastLoginAt
      ? Math.floor(
          (Date.now() - new Date(riskData.lastLoginAt).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : 999

    if (daysSinceLogin >= 30) {
      signals.push({
        type: 'churn_risk',
        severity: daysSinceLogin >= 60 ? 'critical' : 'warning',
        title: `No logins for ${daysSinceLogin} days`,
      })
    }

    if (onboarding && !onboarding.completedAt) {
      const completed = [
        onboarding.classesAdded,
        onboarding.staffAdded,
        onboarding.studentsAdded,
      ].filter(Boolean).length
      signals.push({
        type: 'onboarding_stuck',
        severity: completed === 0 ? 'critical' : 'warning',
        title: `Onboarding ${completed}/3 steps complete`,
      })
    }

    if (studentCount === 0) {
      signals.push({
        type: 'no_students',
        severity: 'warning',
        title: 'No students added yet',
      })
    }

    if (openTickets > 0) {
      signals.push({
        type: 'open_tickets',
        severity: openTickets >= 3 ? 'critical' : 'warning',
        title: `${openTickets} open support ticket${openTickets > 1 ? 's' : ''}`,
      })
    }

    return NextResponse.json({
      institution,
      stats: {
        userCount,
        studentCount,
        classCount,
        openTickets,
      },
      userBreakdown: userBreakdown.map(b => ({
        role: b.portalType,
        count: b._count,
      })),
      onboarding,
      loginActivity,
      riskSignals: signals.slice(0, 3),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
