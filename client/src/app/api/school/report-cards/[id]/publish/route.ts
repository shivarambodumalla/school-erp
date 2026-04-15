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

  const generation = await prisma.reportCardGeneration.findFirst({
    where: { id, institutionId },
    select: { id: true, status: true },
  })

  if (!generation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (generation.status === 'PUBLISHED') {
    return NextResponse.json(
      { error: 'Report card is already published' },
      { status: 400 },
    )
  }

  if (generation.status === 'DRAFT') {
    return NextResponse.json(
      { error: 'Report card must be generated before publishing' },
      { status: 400 },
    )
  }

  await prisma.reportCardGeneration.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  return NextResponse.json({ published: true })
}
