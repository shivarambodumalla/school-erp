import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}


export async function POST(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { courseId } = await routeCtx.params

  const source = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
    include: {
      posts: { include: { attachments: true } },
    },
  })
  if (!source) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const clone = await prisma.course.create({
    data: {
      institutionId,
      title: `${source.title} (Copy)`,
      description: source.description,
      instructorId: ctx.userId,
      targetType: source.targetType,
      targetIds: source.targetIds,
      maxEnrollment: source.maxEnrollment,
      status: 'DRAFT',
      clonedFromId: source.id,
      canPreviewFiles: source.canPreviewFiles,
      canDownloadFiles: source.canDownloadFiles,
    },
  })

  for (const post of source.posts) {
    const newPost = await prisma.coursePost.create({
      data: {
        courseId: clone.id,
        type: post.type,
        title: post.title,
        description: post.description,
        topicTag: post.topicTag,
        isPublished: false,
        order: post.order,
        createdById: ctx.userId,
      },
    })

    for (const att of post.attachments) {
      await prisma.courseAttachment.create({
        data: {
          coursePostId: newPost.id,
          type: att.type,
          url: att.url,
          fileName: att.fileName,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
        },
      })
    }
  }

  return NextResponse.json(clone, { status: 201 })
}
