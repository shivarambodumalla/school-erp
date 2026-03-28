import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: { id: true, institutionId: true },
  })
  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const body = await req.json()
  const { category, title, description, date, photoUrl } = body

  if (!category || !title || !date) {
    return NextResponse.json(
      { error: 'category, title, and date are required' },
      { status: 400 },
    )
  }

  const achievement = await prisma.achievement.create({
    data: {
      institutionId,
      studentId: student.id,
      category,
      title,
      description: description || null,
      date: new Date(date),
      awardedById: session.user.id,
      photoUrl: photoUrl || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      institutionId,
      userId: session.user.id,
      action: 'ACHIEVEMENT_ADDED',
      tableName: 'Achievement',
      recordId: achievement.id,
      after: { title, category },
    },
  })

  return NextResponse.json(achievement, { status: 201 })
}
