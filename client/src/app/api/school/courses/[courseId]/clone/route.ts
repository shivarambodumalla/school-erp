import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

const MANAGEMENT_TYPES = ['ADMIN', 'TEACHER', 'INSTRUCTOR']

export async function POST(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || !MANAGEMENT_TYPES.includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

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
      instructorId: session.user.id,
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
        createdById: session.user.id,
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
