import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import type { PlanTier, Prisma } from '@prisma/client'

/* ─── Plan tier limits (staff / students) ─── */
const PLAN_LIMITS: Record<PlanTier, { maxStaff: number; maxStudents: number }> = {
  STARTER: { maxStaff: 20, maxStudents: 200 },
  GROWTH: { maxStaff: 100, maxStudents: 1000 },
  PRO: { maxStaff: 500, maxStudents: 5000 },
}

const PLAN_ORDER: Record<PlanTier, number> = { STARTER: 0, GROWTH: 1, PRO: 2 }

/* Fields whose change should trigger a session refresh on the client */
const SESSION_REFRESH_FIELDS = new Set([
  'name',
  'logoUrl',
  'primaryColor',
  'secondaryColor',
  'squareLogoUrl',
  'faviconUrl',
])

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? undefined
    const plan = searchParams.get('plan') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = 20

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { subdomain: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        plan ? { planTier: plan as PlanTier } : {},
        status === 'active'
          ? { isActive: true }
          : status === 'suspended'
            ? { isActive: false }
            : {},
      ],
    }

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        select: {
          id: true,
          name: true,
          subdomain: true,
          board: true,
          planTier: true,
          isActive: true,
          suspendedAt: true,
          createdAt: true,
          primaryColor: true,
          logoUrl: true,
          _count: { select: { students: true, users: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.institution.count({ where }),
    ])

    return NextResponse.json({
      institutions: institutions.map((inst) => ({
        ...inst,
        createdAt: inst.createdAt.toISOString(),
        suspendedAt: inst.suspendedAt?.toISOString() ?? null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/* ═══════════════════════════════════════════════════
   PATCH — Update an institution (super admin only)
   Body: { institutionId, confirm?, ...fields }
   ═══════════════════════════════════════════════════ */

interface InstitutionPatchBody {
  institutionId: string
  confirm?: boolean
  name?: string
  logoUrl?: string | null
  primaryColor?: string
  secondaryColor?: string | null
  squareLogoUrl?: string | null
  faviconUrl?: string | null
  planTier?: PlanTier
  isActive?: boolean
  suspendedReason?: string | null
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as InstitutionPatchBody
    const { institutionId, confirm, ...fields } = body

    if (!institutionId) {
      return NextResponse.json(
        { error: 'institutionId is required' },
        { status: 400 }
      )
    }

    // ── Fetch current institution for before-snapshot ──
    const current = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: {
        name: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        squareLogoUrl: true,
        faviconUrl: true,
        planTier: true,
        isActive: true,
        suspendedReason: true,
      },
    })

    if (!current) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }

    // ── 1A: Deactivation guard ──
    if (fields.isActive === false && current.isActive === true) {
      if (!confirm) {
        return NextResponse.json(
          {
            error:
              'Deactivating will block all school logins. Send { confirm: true } to proceed.',
          },
          { status: 400 }
        )
      }
    }

    // ── 1C: Plan tier downgrade warnings ──
    const warnings: string[] = []

    if (
      fields.planTier &&
      fields.planTier !== current.planTier &&
      PLAN_ORDER[fields.planTier] < PLAN_ORDER[current.planTier]
    ) {
      const [staffCount, studentCount] = await Promise.all([
        prisma.staff.count({
          where: { institutionId, status: { not: 'TERMINATED' } },
        }),
        prisma.student.count({
          where: { institutionId, status: { not: 'INACTIVE' } },
        }),
      ])

      const newLimits = PLAN_LIMITS[fields.planTier]

      if (staffCount > newLimits.maxStaff) {
        warnings.push(
          `${fields.planTier} plan allows max ${newLimits.maxStaff} staff — institution currently has ${staffCount}.`
        )
      }
      if (studentCount > newLimits.maxStudents) {
        warnings.push(
          `${fields.planTier} plan allows max ${newLimits.maxStudents} students — institution currently has ${studentCount}.`
        )
      }
    }

    // ── Build update data ──
    const data: Prisma.InstitutionUpdateInput = {}

    if (fields.name !== undefined) data.name = fields.name
    if (fields.logoUrl !== undefined) data.logoUrl = fields.logoUrl
    if (fields.primaryColor !== undefined) data.primaryColor = fields.primaryColor
    if (fields.secondaryColor !== undefined) data.secondaryColor = fields.secondaryColor
    if (fields.squareLogoUrl !== undefined) data.squareLogoUrl = fields.squareLogoUrl
    if (fields.faviconUrl !== undefined) data.faviconUrl = fields.faviconUrl
    if (fields.planTier !== undefined) data.planTier = fields.planTier
    if (fields.isActive !== undefined) {
      data.isActive = fields.isActive
      if (fields.isActive === false) {
        data.suspendedAt = new Date()
        data.suspendedReason = fields.suspendedReason ?? null
      } else {
        data.suspendedAt = null
        data.suspendedReason = null
      }
    }

    const updated = await prisma.institution.update({
      where: { id: institutionId },
      data,
    })

    // ── 1A: Deactivation audit log ──
    if (fields.isActive === false && current.isActive === true) {
      await prisma.auditLog.create({
        data: {
          institutionId,
          userId: session.user.id,
          action: 'INSTITUTION_DEACTIVATED',
          tableName: 'institution',
          recordId: institutionId,
          before: { isActive: true } as Prisma.InputJsonValue,
          after: { isActive: false } as Prisma.InputJsonValue,
        },
      })
    }

    // ── 1B: General field-change audit log ──
    const before: Record<string, unknown> = {}
    const after: Record<string, unknown> = {}

    for (const key of Object.keys(fields) as (keyof typeof fields)[]) {
      if (key === 'suspendedReason') continue // tracked via isActive log
      const oldVal = current[key as keyof typeof current]
      const newVal = fields[key]
      if (oldVal !== newVal) {
        before[key] = oldVal
        after[key] = newVal
      }
    }

    if (Object.keys(after).length > 0) {
      await prisma.auditLog.create({
        data: {
          institutionId,
          userId: session.user.id,
          action: 'INSTITUTION_UPDATED',
          tableName: 'institution',
          recordId: institutionId,
          before: before as Prisma.InputJsonValue,
          after: after as Prisma.InputJsonValue,
        },
      })
    }

    // ── 1B: Session refresh flag ──
    const sessionRefreshRequired = Object.keys(after).some((k) =>
      SESSION_REFRESH_FIELDS.has(k)
    )

    return NextResponse.json({
      institution: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        suspendedAt: updated.suspendedAt?.toISOString() ?? null,
      },
      ...(sessionRefreshRequired ? { sessionRefreshRequired: true } : {}),
      ...(warnings.length > 0 ? { warnings } : {}),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}