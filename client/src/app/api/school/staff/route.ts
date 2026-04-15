import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const PAGE_SIZE = 20

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const url = new URL(req.url)

  const search = url.searchParams.get('search')
  const departmentId = url.searchParams.get('departmentId')
  const roleId = url.searchParams.get('roleId')
  const status = url.searchParams.get('status')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))

  const where: Record<string, unknown> = { institutionId }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { employeeNo: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (departmentId) where.departmentId = departmentId
  if (roleId) where.primaryRoleId = roleId
  if (status) where.status = status

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      select: {
        id: true,
        serialNo: true,
        employeeNo: true,
        firstName: true,
        lastName: true,
        designation: true,
        status: true,
        joiningDate: true,
        phone: true,
        departmentId: true,
        reportsToId: true,
        department: { select: { name: true } },
        primaryRole: { select: { name: true } },
        user: { select: { email: true, lastLoginAt: true } },
        _count: { select: { directReports: true } },
      },
      orderBy: { firstName: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.staff.count({ where }),
  ])

  return NextResponse.json({ staff, total, page })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const body = (await req.json()) as {
    firstName: string
    lastName: string
    designation: string
    departmentId?: string
    primaryRoleId?: string
    reportsToId?: string
    joiningDate: string
    qualification?: string
    specialization?: string
    phone?: string
    personalEmail?: string
    createLogin?: boolean
    loginEmail?: string
    portalType?: string
  }

  // Validate departmentId belongs to same institution
  if (body.departmentId) {
    const dept = await prisma.department.findFirst({
      where: { id: body.departmentId, institutionId },
      select: { id: true },
    })
    if (!dept) {
      return NextResponse.json(
        { error: 'Department not found or does not belong to this institution' },
        { status: 400 },
      )
    }
  }

  // Validate primaryRoleId belongs to same institution
  if (body.primaryRoleId) {
    const role = await prisma.staffRole.findFirst({
      where: { id: body.primaryRoleId, institutionId },
      select: { id: true },
    })
    if (!role) {
      return NextResponse.json(
        { error: 'Staff role not found or does not belong to this institution' },
        { status: 400 },
      )
    }
  }

  // Ensure settings exist, then atomically increment seq
  await prisma.staffSettings.upsert({
    where: { institutionId },
    create: { institutionId },
    update: {},
  })

  const settings = await prisma.staffSettings.update({
    where: { institutionId },
    data: { employeeNoCurrentSeq: { increment: 1 } },
  })

  const seq = settings.employeeNoCurrentSeq
  const employeeNo = `${settings.employeeNoPrefix}${seq}`

  let userId: string | undefined
  let tempPassword: string | undefined

  if (body.createLogin && body.loginEmail) {
    const { generateTempPassword } = await import('@/lib/generate-password')
    tempPassword = generateTempPassword()
    const hashed = await bcrypt.hash(tempPassword, 10)

    const user = await prisma.user.create({
      data: {
        institutionId,
        email: body.loginEmail,
        hashedPassword: hashed,
        portalType: (body.portalType as 'ADMIN' | 'TEACHER') ?? 'TEACHER',
      },
    })
    userId = user.id
  }

  const staff = await prisma.staff.create({
    data: {
      institutionId,
      employeeNo,
      firstName: body.firstName,
      lastName: body.lastName,
      designation: body.designation,
      departmentId: body.departmentId ?? null,
      primaryRoleId: body.primaryRoleId ?? null,
      reportsToId: body.reportsToId ?? null,
      joiningDate: new Date(body.joiningDate),
      qualification: body.qualification ?? null,
      specialization: body.specialization ?? null,
      phone: body.phone ?? null,
      personalEmail: body.personalEmail ?? null,
      userId: userId ?? null,
    },
    select: { id: true, employeeNo: true },
  })

  return NextResponse.json(
    {
      id: staff.id,
      employeeNo: staff.employeeNo,
      tempPassword: tempPassword ?? null,
    },
    { status: 201 },
  )
}
