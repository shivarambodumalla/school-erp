import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const { classYearId } = await context.params
    const body = await req.json() as {
      targetAcademicYearId: string
      cloneSubjects: boolean
      cloneContent: boolean
    }

    if (!body.targetAcademicYearId) {
      return NextResponse.json({ error: 'targetAcademicYearId is required' }, { status: 400 })
    }

    const sourceClassYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
      include: {
        sections: true,
        subjects: {
          include: {
            teachers: true,
            posts: { include: { attachments: true } },
          },
        },
      },
    })
    if (!sourceClassYear) {
      return NextResponse.json({ error: 'Source class year not found' }, { status: 404 })
    }

    // Check no ClassYear exists for same template + target year
    const existingClone = await prisma.classYear.findUnique({
      where: {
        classTemplateId_academicYearId: {
          classTemplateId: sourceClassYear.classTemplateId,
          academicYearId: body.targetAcademicYearId,
        },
      },
    })
    if (existingClone) {
      return NextResponse.json(
        { error: 'A class year already exists for this template and academic year' },
        { status: 409 }
      )
    }

    // Create new ClassYear
    const newClassYear = await prisma.classYear.create({
      data: {
        institutionId,
        classTemplateId: sourceClassYear.classTemplateId,
        academicYearId: body.targetAcademicYearId,
        status: 'DRAFT',
        clonedFromId: classYearId,
      },
    })

    // Clone sections — build a map from old sectionId to new sectionId
    const sectionIdMap = new Map<string, string>()
    for (const section of sourceClassYear.sections) {
      const newSection = await prisma.section.create({
        data: {
          institutionId,
          classYearId: newClassYear.id,
          name: section.name,
          maxStrength: section.maxStrength,
          classTeacherId: section.classTeacherId,
        },
      })
      sectionIdMap.set(section.id, newSection.id)
    }

    // Clone subjects + teachers
    if (body.cloneSubjects) {
      for (const subject of sourceClassYear.subjects) {
        const newSectionId = subject.sectionId
          ? sectionIdMap.get(subject.sectionId) ?? null
          : null

        const newSubject = await prisma.subject.create({
          data: {
            institutionId,
            classYearId: newClassYear.id,
            sectionId: newSectionId,
            name: subject.name,
            code: subject.code,
            weeklyPeriods: subject.weeklyPeriods,
            hasOnlineContent: subject.hasOnlineContent,
            canPreviewFiles: subject.canPreviewFiles,
            canDownloadFiles: subject.canDownloadFiles,
            teachers: {
              create: subject.teachers.map((t) => ({
                teacherId: t.teacherId,
                isPrimary: t.isPrimary,
              })),
            },
          },
        })

        // Clone content (posts + attachments)
        if (body.cloneContent) {
          for (const post of subject.posts) {
            const newSPostSectionId = post.sectionId
              ? sectionIdMap.get(post.sectionId) ?? null
              : null

            await prisma.subjectPost.create({
              data: {
                institutionId,
                subjectId: newSubject.id,
                sectionId: newSPostSectionId,
                type: post.type,
                title: post.title,
                description: post.description,
                scheduledAt: post.scheduledAt,
                isPublished: false,
                canPreview: post.canPreview,
                canDownload: post.canDownload,
                order: post.order,
                topicTag: post.topicTag,
                createdById: post.createdById,
                attachments: {
                  create: post.attachments.map((a) => ({
                    type: a.type,
                    url: a.url,
                    fileName: a.fileName,
                    fileSize: a.fileSize,
                    mimeType: a.mimeType,
                    canPreview: a.canPreview,
                    canDownload: a.canDownload,
                  })),
                },
              },
            })
          }
        }
      }
    }

    return NextResponse.json({ newClassYearId: newClassYear.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/classes/[classYearId]/clone error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
