import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/resources
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const resources = await prisma.subjectResource.findMany({
    where: { subjectId, institutionId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(resources)
}

// POST /api/school/subjects/[subjectId]/resources
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
    name: string
    fileUrl: string
    fileName: string
    fileSize?: number
    mimeType?: string
    description?: string
  }

  if (!body.name?.trim() || !body.fileUrl || !body.fileName) {
    return NextResponse.json(
      { error: 'name, fileUrl, and fileName are required' },
      { status: 400 }
    )
  }

  const resource = await prisma.subjectResource.create({
    data: {
      subjectId,
      institutionId,
      name: body.name.trim(),
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize ?? null,
      mimeType: body.mimeType ?? null,
      description: body.description?.trim() ?? null,
      uploadedById: userId,
    },
  })

  return NextResponse.json(resource, { status: 201 })
}
