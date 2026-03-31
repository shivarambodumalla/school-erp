import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { Prisma, SubjectModuleItemType } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string }> }

// POST /api/school/subjects/[subjectId]/import — import subject content
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    modules?: Array<{
      title: string
      description?: string
      order: number
      items: Array<{
        type: string
        title: string
        description?: string
        content?: Record<string, unknown>
        order: number
      }>
    }>
  }

  if (!body.modules || body.modules.length === 0) {
    return NextResponse.json({ error: 'modules array is required' }, { status: 400 })
  }

  let modulesCreated = 0
  let itemsCreated = 0

  for (const mod of body.modules) {
    const created = await prisma.subjectModule.create({
      data: {
        subjectId,
        title: mod.title,
        description: mod.description ?? null,
        order: mod.order,
        items: {
          create: mod.items.map((item) => ({
            subjectId,
            type: item.type as SubjectModuleItemType,
            title: item.title,
            description: item.description ?? null,
            content: (item.content ?? {}) as Prisma.InputJsonValue,
            order: item.order,
            createdById: userId,
          })),
        },
      },
      include: { _count: { select: { items: true } } },
    })
    modulesCreated++
    itemsCreated += created._count.items
  }

  return NextResponse.json({
    success: true,
    modulesCreated,
    itemsCreated,
  }, { status: 201 })
}
