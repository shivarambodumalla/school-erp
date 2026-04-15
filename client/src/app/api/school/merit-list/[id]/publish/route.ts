import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const config = await prisma.meritListConfig.findFirst({
    where: { id, institutionId },
    select: { id: true, publishedAt: true },
  })

  if (!config) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (config.publishedAt) {
    return NextResponse.json(
      { error: 'Merit list is already published' },
      { status: 400 },
    )
  }

  // Publish the merit list
  await prisma.meritListConfig.update({
    where: { id },
    data: { publishedAt: new Date() },
  })

  // Get all entries with their admission guardians for notifications
  const entries = await prisma.meritListEntry.findMany({
    where: { meritListId: id },
    include: {
      admission: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          guardians: {
            where: { userId: { not: null } },
            select: { userId: true },
          },
        },
      },
    },
  })

  // Create notifications for each guardian with a userId
  const notifications: {
    institutionId: string
    userId: string
    type: 'ANNOUNCEMENT'
    title: string
    body: string
    channel: 'PUSH'
    status: 'PENDING'
    priority: 'NORMAL'
  }[] = []

  for (const entry of entries) {
    for (const guardian of entry.admission.guardians) {
      if (guardian.userId) {
        notifications.push({
          institutionId,
          userId: guardian.userId,
          type: 'ANNOUNCEMENT',
          title: 'Merit List Published',
          body: `Merit list results are available for ${entry.admission.firstName} ${entry.admission.lastName}. Status: ${entry.status}`,
          channel: 'PUSH',
          status: 'PENDING',
          priority: 'NORMAL',
        })
      }
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications })
  }

  // Mark entries as notified
  await prisma.meritListEntry.updateMany({
    where: { meritListId: id },
    data: { notifiedAt: new Date() },
  })

  return NextResponse.json({ notified: notifications.length })
}
