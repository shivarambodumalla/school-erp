import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SubmissionsClient } from '@/features/subjects/components/SubmissionsClient'
import type { SubmissionData } from '@/features/subjects/types'

interface Props {
  params: Promise<{ subjectId: string; postId: string }>
}

export default async function SubmissionsPage({
  params,
}: Props) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId
  const { subjectId, postId } = await params

  const post = await prisma.subjectPost.findFirst({
    where: { id: postId, subjectId, institutionId },
    include: {
      assignment: {
        include: {
          submissions: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  admissionNo: true,
                  rollNo: true,
                  photoUrl: true,
                },
              },
            },
            orderBy: { submittedAt: 'desc' },
          },
        },
      },
    },
  })

  if (!post || !post.assignment) {
    redirect(`/management/subjects/${subjectId}`)
  }

  const submissions: SubmissionData[] =
    post.assignment.submissions.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      studentId: s.studentId,
      fileUrl: s.fileUrl,
      notes: s.notes,
      submittedAt: s.submittedAt.toISOString(),
      isLate: s.isLate,
      marksObtained: s.marksObtained
        ? Number(s.marksObtained)
        : null,
      feedback: s.feedback,
      gradedById: s.gradedById,
      gradedAt: s.gradedAt?.toISOString() ?? null,
      status: s.status,
      student: s.student,
    }))

  return (
    <SubmissionsClient
      subjectId={subjectId}
      postId={postId}
      postTitle={post.title}
      totalMarks={post.assignment.totalMarks}
      submissions={submissions}
    />
  )
}
