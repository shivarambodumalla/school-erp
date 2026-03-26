import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const signals: {
      type: string
      severity: 'critical' | 'warning' | 'info'
      title: string
      description: string
    }[] = []

    const [institution, lastLogin, studentCount, criticalTickets] =
      await Promise.all([
        prisma.institution.findUnique({
          where: { id: params.institutionId },
          select: {
            planTier: true,
            onboarding: {
              select: {
                classesAdded: true,
                staffAdded: true,
                studentsAdded: true,
                completedAt: true,
              },
            },
          },
        }),
        prisma.user.findFirst({
          where: {
            institutionId: params.institutionId,
            lastLoginAt: { not: null },
          },
          orderBy: { lastLoginAt: 'desc' },
          select: { lastLoginAt: true },
        }),
        prisma.student.count({
          where: { institutionId: params.institutionId },
        }),
        prisma.supportTicket.count({
          where: {
            institutionId: params.institutionId,
            status: 'OPEN',
            priority: 'CRITICAL',
          },
        }),
      ])

    // Churn risk
    const daysSinceLogin = lastLogin?.lastLoginAt
      ? Math.floor(
          (Date.now() - new Date(lastLogin.lastLoginAt).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : 999

    if (daysSinceLogin >= 30) {
      signals.push({
        type: 'churn_risk',
        severity: daysSinceLogin >= 60 ? 'critical' : 'warning',
        title: 'No recent logins',
        description:
          `No user has logged in for ${daysSinceLogin} days. High churn risk.`,
      })
    }

    // Onboarding stuck
    if (institution?.onboarding && !institution.onboarding.completedAt) {
      const completed = [
        institution.onboarding.classesAdded,
        institution.onboarding.staffAdded,
        institution.onboarding.studentsAdded,
      ].filter(Boolean).length
      signals.push({
        type: 'onboarding_stuck',
        severity: completed === 0 ? 'critical' : 'warning',
        title: 'Onboarding incomplete',
        description:
          `School completed ${completed}/3 setup steps. May need support.`,
      })
    }

    // No students
    if (studentCount === 0) {
      signals.push({
        type: 'low_adoption',
        severity: 'warning',
        title: 'No students added',
        description: 'Institution has not added any students yet.',
      })
    }

    // Critical tickets
    if (criticalTickets > 0) {
      signals.push({
        type: 'open_tickets',
        severity: 'critical',
        title: `${criticalTickets} critical ticket${criticalTickets > 1 ? 's' : ''} open`,
        description:
          'Unresolved critical support tickets need immediate attention.',
      })
    }

    return NextResponse.json({ signals })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
