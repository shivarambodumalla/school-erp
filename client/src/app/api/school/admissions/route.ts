import { NextResponse, type NextRequest } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAdmissionSchema } from '@/features/admissions/schemas/admissionSchema'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const url = req.nextUrl.searchParams
  const status = url.get('status') || undefined
  const search = url.get('search') || undefined
  const page = Math.max(1, Number(url.get('page') ?? 1))
  const take = Math.min(50, Math.max(1, Number(url.get('take') ?? 20)))
  const skip = (page - 1) * take

  const where = {
    institutionId,
    ...(status && { status: status as never }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { applicationNo: { contains: search, mode: 'insensitive' as const } },
        { admissionNo: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [admissions, total] = await Promise.all([
    prisma.admission.findMany({
      where,
      skip,
      take,
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true,
        serialNo: true,
        applicationNo: true,
        admissionNo: true,
        status: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        gender: true,
        admissionType: true,
        classId: true,
        appliedAt: true,
        admittedAt: true,
        _count: { select: { guardians: true, documents: true } },
      },
    }),
    prisma.admission.count({ where }),
  ])

  return NextResponse.json({ admissions, total, page })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = await req.json()
  const parsed = createAdmissionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 },
    )
  }

  const d = parsed.data

  const result = await prisma.$transaction(async (tx) => {
    const settings = await tx.admissionSettings.upsert({
      where: { institutionId },
      create: { institutionId },
      update: {},
      select: { appNoPrefix: true, appNoCurrentSeq: true },
    })

    const year = new Date().getFullYear()
    const seq = settings.appNoCurrentSeq.toString().padStart(4, '0')
    const applicationNo = `${settings.appNoPrefix}-${year}-${seq}`

    await tx.admissionSettings.update({
      where: { institutionId },
      data: { appNoCurrentSeq: { increment: 1 } },
    })

    const admission = await tx.admission.create({
      data: {
        institutionId,
        applicationNo,
        status: 'APPLIED',
        firstName: d.firstName,
        middleName: d.middleName,
        lastName: d.lastName,
        dateOfBirth: new Date(d.dateOfBirth),
        gender: d.gender,
        bloodGroup: d.bloodGroup,
        nationality: d.nationality,
        religion: d.religion,
        motherTongue: d.motherTongue,
        photoUrl: d.photoUrl,
        admissionType: d.admissionType,
        previousSchoolName: d.previousSchoolName,
        previousClass: d.previousClass,
        previousTCNumber: d.previousTCNumber,
        classId: d.classId,
        sectionId: d.sectionId,
        academicYearId: d.academicYearId,
        customFieldValues: d.customFieldValues ?? {},
        createdById: ctx.userId,
      },
      select: { id: true, applicationNo: true },
    })

    await tx.auditLog.create({
      data: {
        institutionId,
        userId: ctx.userId,
        action: 'ADMISSION_APPLIED',
        tableName: 'Admission',
        recordId: admission.id,
        after: { applicationNo, firstName: d.firstName, lastName: d.lastName },
      },
    })

    return admission
  })

  return NextResponse.json(result, { status: 201 })
}
