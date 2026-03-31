import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; groupSetId: string }> }

// POST /api/school/subjects/[subjectId]/groups/[groupSetId]/generate
// Randomly assigns students to groups
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, groupSetId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    select: { id: true, classYearId: true, sectionId: true },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const groupSet = await prisma.groupSet.findFirst({
    where: { id: groupSetId, subjectId, institutionId },
  })
  if (!groupSet) {
    return NextResponse.json({ error: 'Group set not found' }, { status: 404 })
  }

  // Get enrolled students via StudentSection
  const sectionFilter = subject.sectionId
    ? { sectionId: subject.sectionId }
    : { classYearId: subject.classYearId }

  const studentSections = await prisma.studentSection.findMany({
    where: { ...sectionFilter, institutionId, status: 'ACTIVE' },
    select: { studentId: true },
  })

  const studentIds = studentSections.map((s) => s.studentId)

  if (studentIds.length === 0) {
    return NextResponse.json({ error: 'No students enrolled' }, { status: 400 })
  }

  // Fisher-Yates shuffle
  const shuffled = [...studentIds]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  // Calculate number of groups
  const groupSize = groupSet.maxSize
  const numGroups = Math.ceil(shuffled.length / groupSize)

  // Delete existing groups for this set
  await prisma.subjectGroup.deleteMany({
    where: { groupSetId },
  })

  // Create groups and assign students
  const groups = []
  for (let g = 0; g < numGroups; g++) {
    const members = shuffled.slice(g * groupSize, (g + 1) * groupSize)
    const group = await prisma.subjectGroup.create({
      data: {
        groupSetId,
        subjectId,
        name: `Group ${g + 1}`,
        members: {
          create: members.map((studentId) => ({ studentId })),
        },
      },
      include: {
        members: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNo: true },
            },
          },
        },
      },
    })
    groups.push(group)
  }

  return NextResponse.json({ groupSetId, groups }, { status: 201 })
}
