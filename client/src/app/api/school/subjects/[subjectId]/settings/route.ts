import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { EnrollmentType } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/settings
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    select: {
      id: true,
      name: true,
      code: true,
      color: true,
      logo: true,
      description: true,
      hasOnlineContent: true,
      canPreviewFiles: true,
      canDownloadFiles: true,
      enrollmentType: true,
      showGradesToStudents: true,
      allowLateSubmission: true,
      completionTrackingEnabled: true,
      subjectStartDate: true,
      coTeachers: true,
      teachingAssistants: true,
    },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  return NextResponse.json(subject)
}

// PATCH /api/school/subjects/[subjectId]/settings
export async function PATCH(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    name?: string
    code?: string
    color?: string
    logo?: string
    description?: string
    hasOnlineContent?: boolean
    canPreviewFiles?: boolean
    canDownloadFiles?: boolean
    enrollmentType?: string
    showGradesToStudents?: boolean
    allowLateSubmission?: boolean
    completionTrackingEnabled?: boolean
    subjectStartDate?: string | null
    coTeachers?: string[]
    teachingAssistants?: string[]
  }

  const updated = await prisma.subject.update({
    where: { id: subjectId },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.code !== undefined && { code: body.code }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.logo !== undefined && { logo: body.logo }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.hasOnlineContent !== undefined && { hasOnlineContent: body.hasOnlineContent }),
      ...(body.canPreviewFiles !== undefined && { canPreviewFiles: body.canPreviewFiles }),
      ...(body.canDownloadFiles !== undefined && { canDownloadFiles: body.canDownloadFiles }),
      ...(body.enrollmentType !== undefined && { enrollmentType: body.enrollmentType as EnrollmentType }),
      ...(body.showGradesToStudents !== undefined && { showGradesToStudents: body.showGradesToStudents }),
      ...(body.allowLateSubmission !== undefined && { allowLateSubmission: body.allowLateSubmission }),
      ...(body.completionTrackingEnabled !== undefined && {
        completionTrackingEnabled: body.completionTrackingEnabled,
      }),
      ...(body.subjectStartDate !== undefined && {
        subjectStartDate: body.subjectStartDate ? new Date(body.subjectStartDate) : null,
      }),
      ...(body.coTeachers !== undefined && { coTeachers: body.coTeachers }),
      ...(body.teachingAssistants !== undefined && { teachingAssistants: body.teachingAssistants }),
    },
  })

  return NextResponse.json(updated)
}
