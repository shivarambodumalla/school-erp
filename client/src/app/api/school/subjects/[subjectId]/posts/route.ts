import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import type { SubjectPostType, AttachmentType } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string }> }

const PAGE_SIZE = 20

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json(
      { error: 'No institution' },
      { status: 400 }
    )
  }

  try {
    const { subjectId } = await context.params
    const url = new URL(req.url)
    const typeFilter = url.searchParams.get('type') as
      | SubjectPostType
      | null
    const page = Math.max(
      1,
      Number(url.searchParams.get('page') ?? '1')
    )

    const where = {
      subjectId,
      institutionId,
      ...(typeFilter ? { type: typeFilter } : {}),
    }

    const [posts, total] = await Promise.all([
      prisma.subjectPost.findMany({
        where,
        include: {
          attachments: true,
          assignment: true,
          quiz: true,
          poll: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.subjectPost.count({ where }),
    ])

    return NextResponse.json({ posts, total })
  } catch (err) {
    console.error('GET posts:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface AttachmentInput {
  type: AttachmentType
  url: string
  fileName?: string
  fileSize?: number
  mimeType?: string
}

interface PostBody {
  type: SubjectPostType
  title: string
  description?: string
  scheduledAt?: string
  canPreview?: boolean
  canDownload?: boolean
  topicTag?: string
  sectionId?: string
  attachments?: AttachmentInput[]
  dueDate?: string
  totalMarks?: number
  question?: string
  options?: string[]
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json(
      { error: 'No institution' },
      { status: 400 }
    )
  }

  try {
    const { subjectId } = await context.params
    const body = (await req.json()) as PostBody

    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'type and title are required' },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, institutionId },
    })
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    const post = await prisma.subjectPost.create({
      data: {
        institutionId,
        subjectId,
        sectionId: body.sectionId ?? null,
        type: body.type,
        title: body.title,
        description: body.description ?? null,
        scheduledAt: body.scheduledAt
          ? new Date(body.scheduledAt)
          : null,
        canPreview: body.canPreview ?? true,
        canDownload: body.canDownload ?? false,
        topicTag: body.topicTag ?? null,
        createdById: session.user.id,
        attachments: body.attachments?.length
          ? {
              create: body.attachments.map((a) => ({
                type: a.type,
                url: a.url,
                fileName: a.fileName ?? null,
                fileSize: a.fileSize ?? null,
                mimeType: a.mimeType ?? null,
              })),
            }
          : undefined,
        assignment:
          body.type === 'ASSIGNMENT'
            ? {
                create: {
                  dueDate: new Date(body.dueDate ?? ''),
                  totalMarks: body.totalMarks ?? 100,
                },
              }
            : undefined,
        quiz:
          body.type === 'QUIZ'
            ? { create: { totalMarks: 0 } }
            : undefined,
        poll:
          body.type === 'POLL'
            ? {
                create: {
                  question: body.question ?? body.title,
                  options: body.options ?? [],
                },
              }
            : undefined,
      },
      include: {
        attachments: true,
        assignment: true,
        quiz: true,
        poll: true,
      },
    })

    if (
      body.type === 'HOMEWORK' &&
      body.dueDate &&
      subject.sectionId
    ) {
      await prisma.homeworkLog.create({
        data: {
          institutionId,
          subjectPostId: post.id,
          subjectId,
          sectionId: subject.sectionId,
          title: body.title,
          description: body.description ?? null,
          dueDate: new Date(body.dueDate),
          createdById: session.user.id,
        },
      })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    console.error('POST posts:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
