import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* ═══════════════════════════════════════════════════
   DependencyError — thrown when an operation is blocked
   by existing relationships or data integrity rules.
   API routes catch this and return 409 Conflict.
   ═══════════════════════════════════════════════════ */

export class DependencyError extends Error {
  code: string
  constructor(message: string, code = 'DEPENDENCY_BLOCK') {
    super(message)
    this.name = 'DependencyError'
    this.code = code
  }
}

export function handleDependencyError(error: unknown): NextResponse {
  if (error instanceof DependencyError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 409 }
    )
  }
  throw error
}

/* ─── INSTITUTION CHECKS ─── */

export async function checkInstitutionActive(institutionId: string): Promise<void> {
  const inst = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { isActive: true },
  })
  if (!inst?.isActive) {
    throw new DependencyError('Institution is deactivated.')
  }
}

/* ─── DEPARTMENT CHECKS ─── */

export async function checkDeptHasNoStaff(deptId: string): Promise<void> {
  const count = await prisma.staff.count({
    where: { departmentId: deptId, status: { not: 'TERMINATED' } },
  })
  if (count > 0) {
    throw new DependencyError(
      `Cannot delete — ${count} active staff assigned to this department. Reassign staff first.`
    )
  }
}

export async function checkDeptHasNoSubjects(deptId: string): Promise<void> {
  const dept = await prisma.department.findUnique({
    where: { id: deptId },
    select: { subjectNames: true },
  })
  if (dept && dept.subjectNames.length > 0) {
    throw new DependencyError(
      `Cannot delete — ${dept.subjectNames.length} subjects linked to this department.`
    )
  }
}

/* ─── STAFF CHECKS ─── */

export async function checkStaffNotHOD(staffId: string): Promise<{
  isHOD: boolean
  departments: string[]
}> {
  const depts = await prisma.department.findMany({
    where: { OR: [{ hodId: staffId }, { deputyHodId: staffId }] },
    select: { name: true },
  })
  return {
    isHOD: depts.length > 0,
    departments: depts.map(d => d.name),
  }
}

export async function checkStaffNotClassTeacher(staffId: string): Promise<{
  isClassTeacher: boolean
  sections: string[]
}> {
  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  })
  if (!currentYear) return { isClassTeacher: false, sections: [] }

  const assignments = await prisma.classTeacherAssignment.findMany({
    where: { staffId, academicYearId: currentYear.id },
    include: {
      section: {
        select: {
          name: true,
          classYear: { select: { classTemplate: { select: { name: true } } } },
        },
      },
    },
  })
  return {
    isClassTeacher: assignments.length > 0,
    sections: assignments.map(a => `${a.section.classYear.classTemplate.name} ${a.section.name}`),
  }
}

export async function checkStaffNotPrimarySubjectTeacher(staffId: string): Promise<{
  isPrimaryTeacher: boolean
  subjects: string[]
}> {
  const teachings = await prisma.subjectTeacher.findMany({
    where: { teacherId: staffId, isPrimary: true },
    include: { subject: { select: { name: true } } },
  })
  return {
    isPrimaryTeacher: teachings.length > 0,
    subjects: teachings.map(t => t.subject.name),
  }
}

export async function checkStaffRoleNotInUse(roleId: string): Promise<void> {
  const [primaryCount, secondaryCount] = await Promise.all([
    prisma.staff.count({ where: { primaryRoleId: roleId } }),
    prisma.staffRoleAssignment.count({ where: { staffRoleId: roleId } }),
  ])
  const total = primaryCount + secondaryCount
  if (total > 0) {
    throw new DependencyError(
      `Cannot delete — ${total} staff assigned to this role. Reassign staff first.`
    )
  }
}

/* ─── CLASS CHECKS ─── */

export async function checkAcademicYearExists(institutionId: string): Promise<void> {
  const count = await prisma.academicYear.count({ where: { institutionId } })
  if (count === 0) {
    throw new DependencyError(
      'No academic year found. Create an academic year before adding classes.'
    )
  }
}

export async function checkSectionHasNoActiveStudents(sectionId: string): Promise<void> {
  const count = await prisma.studentSection.count({
    where: { sectionId, status: 'ACTIVE' },
  })
  if (count > 0) {
    throw new DependencyError(
      `Cannot delete — ${count} students enrolled in this section. Move students to another section first.`
    )
  }
}

export async function checkClassYearHasNoData(classYearId: string): Promise<void> {
  const sectionIds = (await prisma.section.findMany({
    where: { classYearId },
    select: { id: true },
  })).map(s => s.id)

  const [stuCount, attCount, gradeCount] = await Promise.all([
    prisma.studentSection.count({ where: { classYearId } }),
    sectionIds.length > 0
      ? prisma.attendance.count({ where: { sectionId: { in: sectionIds } } })
      : Promise.resolve(0),
    prisma.gradeEntry.count({ where: { subject: { classYearId } } }),
  ])
  if (stuCount > 0 || attCount > 0 || gradeCount > 0) {
    throw new DependencyError(
      `Cannot delete — class has historical data (${stuCount} enrollments, ${attCount} attendance records, ${gradeCount} grade entries). Archive instead.`
    )
  }
}

export async function checkSectionCapacity(sectionId: string): Promise<{
  current: number
  max: number | null
  isFull: boolean
}> {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { maxStrength: true },
  })
  const current = await prisma.studentSection.count({
    where: { sectionId, status: 'ACTIVE' },
  })
  const max = section?.maxStrength ?? null
  const isFull = max !== null && current >= max
  if (isFull) {
    throw new DependencyError(
      `Section is at full capacity (${current}/${max}). Increase capacity in section settings or choose another section.`
    )
  }
  return { current, max, isFull }
}

export async function checkClassYearIsActive(classYearId: string): Promise<void> {
  const cy = await prisma.classYear.findUnique({
    where: { id: classYearId },
    select: { status: true },
  })
  if (cy?.status === 'ARCHIVED') {
    throw new DependencyError('Cannot enroll — this class year is archived.')
  }
  if (cy?.status === 'DRAFT') {
    throw new DependencyError('Cannot enroll — this class year is still in draft.')
  }
}

/* ─── SUBJECT CHECKS ─── */

export async function checkSubjectHasNoData(subjectId: string): Promise<void> {
  const [gradeCount, subCount] = await Promise.all([
    prisma.gradeEntry.count({ where: { subjectId } }),
    prisma.assignmentSubmission.count({
      where: { assignment: { subjectPost: { subjectId } } },
    }),
  ])
  if (gradeCount > 0 || subCount > 0) {
    throw new DependencyError(
      `Cannot delete — subject has student data (${gradeCount} grades, ${subCount} submissions). Archive instead.`
    )
  }
}

export async function checkSubjectHasTeacher(subjectId: string): Promise<boolean> {
  const count = await prisma.subjectTeacher.count({
    where: { subjectId, isPrimary: true },
  })
  return count === 0
}

/* ─── STUDENT CHECKS ─── */

export async function checkStudentHasNoFinancialData(studentId: string): Promise<void> {
  const count = await prisma.feePayment.count({
    where: { studentId, status: { not: 'PENDING' } },
  })
  if (count > 0) {
    throw new DependencyError(
      `Cannot permanently delete — student has ${count} payment records. Mark as inactive instead.`
    )
  }
}

export async function checkGuardianNotOnly(studentId: string): Promise<void> {
  const count = await prisma.guardian.count({ where: { studentId } })
  if (count <= 1) {
    throw new DependencyError(
      'Cannot remove — student must have at least one guardian.'
    )
  }
}

export async function checkStudentNotDuplicateEnrollment(
  studentId: string,
  classYearId: string
): Promise<void> {
  const existing = await prisma.studentSection.findFirst({
    where: { studentId, classYearId, status: 'ACTIVE' },
  })
  if (existing) {
    throw new DependencyError(
      'Student is already enrolled in a section of this class.'
    )
  }
}

/* ─── FEE CHECKS ─── */

export async function checkFeeCategoryNotInUse(categoryId: string): Promise<void> {
  const count = await prisma.feePayment.count({
    where: { feeCategoryId: categoryId },
  })
  if (count > 0) {
    throw new DependencyError(
      `Cannot delete — ${count} payment records use this category. Deactivate instead.`
    )
  }
}

export async function checkExamTypeNotInUse(examTypeId: string): Promise<void> {
  const [gradeCount, schedCount] = await Promise.all([
    prisma.gradeEntry.count({ where: { examTypeId } }),
    prisma.examSchedule.count({ where: { examTypeId } }),
  ])
  if (gradeCount > 0 || schedCount > 0) {
    throw new DependencyError(
      `Cannot delete — exam type has ${gradeCount} grade entries and ${schedCount} schedules. Cannot delete exam types with recorded data.`
    )
  }
}

/* ─── CASCADE HELPERS ─── */

export async function cascadeStaffDeactivation(
  staffId: string,
  institutionId: string
): Promise<{
  departmentsCleared: number
  classAssignmentsRemoved: number
  loginDisabled: boolean
  leavesCancelled: number
}> {
  // 1. Clear HOD/Deputy from departments
  const [hodDepts, deputyDepts] = await Promise.all([
    prisma.department.updateMany({
      where: { hodId: staffId },
      data: { hodId: null, hodSince: null },
    }),
    prisma.department.updateMany({
      where: { deputyHodId: staffId },
      data: { deputyHodId: null },
    }),
  ])

  // 2. Clear reportsTo references
  await prisma.staff.updateMany({
    where: { reportsToId: staffId, institutionId },
    data: { reportsToId: null },
  })

  // 3. Remove active class teacher assignments
  const currentYear = await prisma.academicYear.findFirst({
    where: { institutionId, isCurrent: true },
    select: { id: true },
  })
  let classAssignmentsRemoved = 0
  if (currentYear) {
    const result = await prisma.classTeacherAssignment.deleteMany({
      where: { staffId, academicYearId: currentYear.id },
    })
    classAssignmentsRemoved = result.count
  }

  // 4. Disable user login
  let loginDisabled = false
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: { userId: true },
  })
  if (staff?.userId) {
    await prisma.user.update({
      where: { id: staff.userId },
      data: { isActive: false },
    })
    loginDisabled = true
  }

  // 5. Cancel pending leaves
  const leaveResult = await prisma.staffLeave.updateMany({
    where: { staffId, status: 'PENDING' },
    data: { status: 'CANCELLED', approvalComment: 'Staff deactivated' },
  })

  return {
    departmentsCleared: hodDepts.count + deputyDepts.count,
    classAssignmentsRemoved,
    loginDisabled,
    leavesCancelled: leaveResult.count,
  }
}

export async function cascadeStudentUnenroll(
  studentId: string,
  sectionId: string
): Promise<{ ok: true }> {
  await prisma.studentSection.updateMany({
    where: { studentId, sectionId, status: 'ACTIVE' },
    data: { status: 'TRANSFERRED' },
  })
  return { ok: true }
}

export async function cascadeGuardianLoginRemoval(guardianId: string): Promise<void> {
  const guardian = await prisma.guardian.findUnique({
    where: { id: guardianId },
    select: { userId: true },
  })
  if (guardian?.userId) {
    await prisma.user.update({
      where: { id: guardian.userId },
      data: { isActive: false },
    })
  }
  await prisma.guardian.update({
    where: { id: guardianId },
    data: { canLogin: false },
  })
}
