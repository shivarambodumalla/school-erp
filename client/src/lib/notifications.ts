import { prisma } from '@/lib/prisma'
import type {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '@prisma/client'

interface SendNotificationParams {
  institutionId: string
  userIds: string[]
  type: NotificationType
  title: string
  body: string
  channel?: NotificationChannel
  priority?: NotificationPriority
  data?: Record<string, string>
  scheduledAt?: Date
}

export async function sendNotifications(
  params: SendNotificationParams
): Promise<number> {
  const {
    institutionId, userIds, type, title, body,
    channel = 'PUSH', priority = 'NORMAL',
    data = {}, scheduledAt,
  } = params

  if (userIds.length === 0) return 0

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: { in: userIds }, institutionId },
    select: {
      userId: true, mutedTypes: true,
      pushEnabled: true, whatsappEnabled: true,
      emailEnabled: true, smsEnabled: true,
    },
  })

  const prefMap = new Map(prefs.map(p => [p.userId, p]))

  const eligible = userIds.filter(uid => {
    const pref = prefMap.get(uid)
    if (!pref) return true
    if (pref.mutedTypes.includes(type)) return false
    if (channel === 'PUSH' && !pref.pushEnabled) return false
    if (channel === 'WHATSAPP' && !pref.whatsappEnabled) return false
    if (channel === 'EMAIL' && !pref.emailEnabled) return false
    if (channel === 'SMS' && !pref.smsEnabled) return false
    return true
  })

  if (eligible.length === 0) return 0

  await prisma.notification.createMany({
    data: eligible.map(userId => ({
      institutionId,
      userId,
      type,
      title,
      body,
      channel,
      priority,
      status: scheduledAt ? 'PENDING' as const : 'SENT' as const,
      data: JSON.parse(JSON.stringify(data)),
      scheduledAt: scheduledAt ?? null,
      sentAt: scheduledAt ? null : new Date(),
    })),
  })

  console.info(
    `[Notifications] Sent ${eligible.length} ${channel} type=${type}`
  )

  return eligible.length
}

export async function resolveTargetUserIds(
  institutionId: string,
  target: {
    type: 'ALL' | 'CLASS' | 'SECTION' | 'ROLE' | 'USER'
    ids?: string[]
    portalTypes?: string[]
  }
): Promise<string[]> {
  if (target.type === 'USER' && target.ids) {
    return target.ids
  }

  if (target.type === 'ROLE' && target.portalTypes) {
    const users = await prisma.user.findMany({
      where: {
        institutionId,
        portalType: { in: target.portalTypes as never[] },
        isActive: true,
      },
      select: { id: true },
    })
    return users.map(u => u.id)
  }

  if (target.type === 'CLASS' && target.ids) {
    const sections = await prisma.section.findMany({
      where: { classYearId: { in: target.ids } },
      select: { id: true },
    })
    const ss = await prisma.studentSection.findMany({
      where: {
        sectionId: { in: sections.map(s => s.id) },
        status: 'ACTIVE',
      },
      include: { student: { select: { userId: true } } },
    })
    return ss.map(s => s.student.userId).filter(Boolean) as string[]
  }

  if (target.type === 'SECTION' && target.ids) {
    const ss = await prisma.studentSection.findMany({
      where: { sectionId: { in: target.ids }, status: 'ACTIVE' },
      include: { student: { select: { userId: true } } },
    })
    return ss.map(s => s.student.userId).filter(Boolean) as string[]
  }

  const users = await prisma.user.findMany({
    where: { institutionId, isActive: true },
    select: { id: true },
  })
  return users.map(u => u.id)
}

export function interpolateTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => vars[key] ?? `{${key}}`
  )
}
