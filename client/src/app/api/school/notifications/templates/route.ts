import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx

  const templates = await prisma.notificationTemplate.findMany({
    where: { institutionId: ctx.institutionId },
    orderBy: { type: 'asc' },
  })

  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = await req.json() as {
    type: string
    name: string
    titleTemplate: string
    bodyTemplate: string
    channel: string
  }

  if (!body.type || !body.name || !body.titleTemplate || !body.bodyTemplate || !body.channel) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const template = await prisma.notificationTemplate.upsert({
    where: {
      institutionId_type_channel: {
        institutionId,
        type: body.type as never,
        channel: body.channel as never,
      },
    },
    create: {
      institutionId,
      type: body.type as never,
      name: body.name,
      titleTemplate: body.titleTemplate,
      bodyTemplate: body.bodyTemplate,
      channel: body.channel as never,
    },
    update: {
      name: body.name,
      titleTemplate: body.titleTemplate,
      bodyTemplate: body.bodyTemplate,
    },
  })

  return NextResponse.json(template)
}
