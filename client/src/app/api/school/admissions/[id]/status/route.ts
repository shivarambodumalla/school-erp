import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { statusTransitionSchema } from '@/features/admissions/schemas/admissionSchema'
import bcrypt from 'bcryptjs'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, context: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { id } = await context.params
  const body = await req.json()
  const parsed = statusTransitionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 },
    )
  }

  const { action, reason, classId, sectionId } = parsed.data

  const admission = await prisma.admission.findFirst({
    where: { id, institutionId },
    include: { guardians: true },
  })

  if (!admission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    if (action === 'ADMIT') {
      return await handleAdmit(admission, institutionId, ctx.userId)
    }
    if (action === 'ENROLL') {
      return await handleEnroll(admission, institutionId, ctx.userId, classId, sectionId)
    }
    if (action === 'REJECT') {
      return await handleReject(admission, institutionId, ctx.userId, reason)
    }
  } catch (err) {
    console.error(`POST /api/school/admissions/${id}/status error:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

type AdmissionWithGuardians = NonNullable<
  Awaited<ReturnType<typeof prisma.admission.findFirst<{ include: { guardians: true } }>>>
>

async function handleAdmit(
  admission: AdmissionWithGuardians,
  institutionId: string,
  userId: string,
) {
  if (admission.status !== 'APPLIED') {
    return NextResponse.json(
      { error: `Cannot admit from ${admission.status} state` },
      { status: 400 },
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const settings = await tx.admissionSettings.upsert({
      where: { institutionId },
      create: { institutionId },
      update: {},
      select: { admissionNoPrefix: true, admissionNoCurrentSeq: true },
    })

    const admissionNo = `${settings.admissionNoPrefix}${settings.admissionNoCurrentSeq}`

    await tx.admissionSettings.update({
      where: { institutionId },
      data: { admissionNoCurrentSeq: { increment: 1 } },
    })

    const updated = await tx.admission.update({
      where: { id: admission.id },
      data: { status: 'ADMITTED', admissionNo, admittedAt: new Date() },
      select: { id: true, admissionNo: true, status: true },
    })

    await tx.auditLog.create({
      data: {
        institutionId, userId,
        action: 'ADMISSION_ADMITTED',
        tableName: 'Admission',
        recordId: admission.id,
        after: { admissionNo },
      },
    })

    return updated
  })

  return NextResponse.json(result)
}

async function handleEnroll(
  admission: AdmissionWithGuardians,
  institutionId: string,
  userId: string,
  classId?: string,
  sectionId?: string,
) {
  if (admission.status !== 'ADMITTED') {
    return NextResponse.json(
      { error: `Cannot enroll from ${admission.status} state` },
      { status: 400 },
    )
  }

  const finalClassId = classId ?? admission.classId
  if (!finalClassId) {
    return NextResponse.json(
      { error: 'Class is required for enrollment' },
      { status: 400 },
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const settings = await tx.admissionSettings.upsert({
      where: { institutionId },
      create: { institutionId },
      update: {},
      select: { rollNoPrefix: true, rollNoCurrentSeq: true },
    })

    const rollNo = `${settings.rollNoPrefix}${settings.rollNoCurrentSeq}`
    const year = new Date().getFullYear()
    const sisId = `ONF-${year}-${settings.rollNoCurrentSeq.toString().padStart(4, '0')}`

    await tx.admissionSettings.update({
      where: { institutionId },
      data: { rollNoCurrentSeq: { increment: 1 } },
    })

    // Find primary guardian for student record
    const primaryGuardian = admission.guardians.find(g => g.isPrimaryContact)
      ?? admission.guardians[0]

    const student = await tx.student.create({
      data: {
        institutionId,
        admissionId: admission.id,
        admissionNo: admission.admissionNo ?? '',
        sisId,
        rollNo,
        firstName: admission.firstName,
        lastName: admission.lastName,
        dateOfBirth: admission.dateOfBirth,
        gender: admission.gender,
        photoUrl: admission.photoUrl,
        guardianName: primaryGuardian?.name ?? '',
        guardianPhone: primaryGuardian?.phone ?? '',
        status: 'ACTIVE',
      },
      select: { id: true },
    })

    // Link student to class/section via StudentSection
    const finalSectionId = sectionId ?? admission.sectionId ?? ''
    if (finalSectionId) {
      await tx.studentSection.create({
        data: {
          institutionId,
          studentId: student.id,
          sectionId: finalSectionId,
          classYearId: finalClassId,
          status: 'ACTIVE',
        },
      })
    }

    // Copy guardians to student and create parent accounts
    const tempPassword = await bcrypt.hash('TempPass@123', 10)

    for (const g of admission.guardians) {
      let guardianUserId: string | undefined

      if (g.canLogin && g.email) {
        const existing = await tx.user.findUnique({
          where: {
            institutionId_email: { institutionId, email: g.email },
          },
          select: { id: true },
        })

        if (existing) {
          guardianUserId = existing.id
        } else {
          const user = await tx.user.create({
            data: {
              email: g.email,
              hashedPassword: tempPassword,
              portalType: 'PARENT',
              institutionId,
              isActive: true,
            },
            select: { id: true },
          })
          guardianUserId = user.id
        }
      }

      await tx.guardian.create({
        data: {
          studentId: student.id,
          type: g.type as 'FATHER' | 'MOTHER' | 'GUARDIAN',
          relationship: g.relationship,
          name: g.name,
          phone: g.phone,
          alternatePhone: g.alternatePhone,
          email: g.email,
          occupation: g.occupation,
          idProofType: g.idProofType,
          idProofNumber: g.idProofNumber,
          isPrimaryContact: g.isPrimaryContact,
          isEmergencyContact: g.isEmergencyContact,
          canLogin: g.canLogin,
          userId: guardianUserId,
        },
      })
    }

    await tx.admission.update({
      where: { id: admission.id },
      data: { status: 'ENROLLED', enrolledAt: new Date() },
    })

    await tx.auditLog.create({
      data: {
        institutionId, userId,
        action: 'STUDENT_ENROLLED',
        tableName: 'Admission',
        recordId: admission.id,
        after: { studentId: student.id, rollNo, sisId },
      },
    })

    return { studentId: student.id }
  })

  return NextResponse.json(result)
}

async function handleReject(
  admission: AdmissionWithGuardians,
  institutionId: string,
  userId: string,
  reason?: string,
) {
  if (!reason) {
    return NextResponse.json(
      { error: 'Reason is required for rejection' },
      { status: 400 },
    )
  }

  if (admission.status === 'ENROLLED') {
    return NextResponse.json(
      { error: 'Cannot reject an enrolled student' },
      { status: 400 },
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.admission.update({
      where: { id: admission.id },
      data: { status: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason },
      select: { id: true, status: true },
    })

    await tx.auditLog.create({
      data: {
        institutionId, userId,
        action: 'ADMISSION_REJECTED',
        tableName: 'Admission',
        recordId: admission.id,
        after: { reason },
      },
    })

    return result
  })

  return NextResponse.json(updated)
}
