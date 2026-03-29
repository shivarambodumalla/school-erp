import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

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
