import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
  sendNotifications,
  resolveTargetUserIds,
} from '@/lib/notifications'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, [
    'ADMIN', 'TEACHER', 'STUDENT', 'PARENT',
  ])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const take = Math.min(50, Math.max(1, Number(url.searchParams.get('take') ?? '20')))

  const where: Record<string, unknown> = {
    institutionId,
    userId,
  }
  if (status) where.status = status
  if (type) where.type = type

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { institutionId, userId, status: 'SENT' },
    }),
  ])

  return NextResponse.json({ notifications, total, unreadCount })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = await req.json() as {
    title: string
    body: string
    type: string
    channel?: string
    priority?: string
    target: {
      type: 'ALL' | 'CLASS' | 'SECTION' | 'ROLE' | 'USER'
      ids?: string[]
      portalTypes?: string[]
    }
    scheduledAt?: string
    data?: Record<string, string>
  }

  if (!body.title || !body.body || !body.type || !body.target) {
    return NextResponse.json(
      { error: 'title, body, type, and target are required' },
      { status: 400 }
    )
  }

  const userIds = await resolveTargetUserIds(institutionId, body.target)

  const sent = await sendNotifications({
    institutionId,
    userIds,
    type: body.type as never,
    title: body.title,
    body: body.body,
    channel: (body.channel as never) ?? 'PUSH',
    priority: (body.priority as never) ?? 'NORMAL',
    data: body.data,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
  })

  await prisma.auditLog.create({
    data: {
      institutionId,
      userId: ctx.userId,
      action: 'NOTIFICATION_SENT',
      tableName: 'Notification',
      recordId: '',
      after: {
        type: body.type,
        target: body.target,
        sent,
      },
    },
  })

  return NextResponse.json({ sent, scheduledAt: body.scheduledAt ?? null })
}
