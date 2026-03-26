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
    const tickets = await prisma.supportTicket.findMany({
      where: { institutionId },
      select: {
        id: true, title: true, priority: true,
        status: true, createdAt: true, resolvedAt: true,
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const resolved = tickets.filter(t => t.resolvedAt)
    const avgResolutionHours = resolved.length > 0
      ? Math.round(
          resolved.reduce((sum, t) => {
            const diff =
              new Date(t.resolvedAt!).getTime() -
              new Date(t.createdAt).getTime()
            return sum + diff / (1000 * 60 * 60)
          }, 0) / resolved.length
        )
      : 0

    return NextResponse.json({
      openCount: tickets.filter(t => t.status === 'OPEN').length,
      avgResolutionHours,
      lastTicketDate: tickets[0]?.createdAt.toISOString() ?? null,
      tickets: tickets.map(t => ({
        id: t.id, title: t.title,
        priority: t.priority, status: t.status,
        createdAt: t.createdAt.toISOString(),
        messageCount: t._count.messages,
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
