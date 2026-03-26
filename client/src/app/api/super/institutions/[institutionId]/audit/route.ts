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
    const logs = await prisma.auditLog.findMany({
      where: { institutionId: params.institutionId },
      select: {
        id: true, action: true, tableName: true,
        recordId: true, before: true, after: true,
        createdAt: true, userId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // AuditLog has no user relation — resolve emails separately
    const userIds = Array.from(new Set(logs.map(l => l.userId)))
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : []
    const emailMap = new Map(users.map(u => [u.id, u.email]))

    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        tableName: l.tableName,
        recordId: l.recordId,
        before: l.before,
        after: l.after,
        createdAt: l.createdAt.toISOString(),
        userEmail: emailMap.get(l.userId) ?? l.userId,
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
