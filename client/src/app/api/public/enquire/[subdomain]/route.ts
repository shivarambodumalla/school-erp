import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicEnquirySchema } from '@/features/leads/schemas/leadSchema'

interface RouteParams {
  params: Promise<{ subdomain: string }>
}

/** GET /api/public/enquire/[subdomain] — institution info for public form (NO AUTH) */
export async function GET(_req: Request, { params }: RouteParams) {
  const { subdomain } = await params

  const institution = await prisma.institution.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      squareLogoUrl: true,
    },
  })

  if (!institution) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
  }

  // Get class templates for the form dropdown
  const classes = await prisma.classTemplate.findMany({
    where: { institutionId: institution.id },
    select: { id: true, name: true },
    orderBy: { gradeLevel: 'asc' },
  })

  return NextResponse.json({ institution, classes })
}

/** POST /api/public/enquire/[subdomain] — create lead from public form (NO AUTH) */
export async function POST(req: Request, { params }: RouteParams) {
  const { subdomain } = await params

  const institution = await prisma.institution.findUnique({
    where: { subdomain },
    select: { id: true, name: true },
  })

  if (!institution) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
  }

  const body: unknown = await req.json()
  const parsed = publicEnquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data

  // Try to match target class by name
  let targetClassId: string | null = null
  if (data.targetClassName) {
    const cls = await prisma.classTemplate.findFirst({
      where: {
        institutionId: institution.id,
        name: { equals: data.targetClassName, mode: 'insensitive' },
      },
      select: { id: true },
    })
    targetClassId = cls?.id ?? null
  }

  const lead = await prisma.lead.create({
    data: {
      institutionId: institution.id,
      name: `${data.parentName.trim()} (${data.studentName.trim()})`,
      phone: data.parentPhone.trim(),
      email: data.parentEmail?.trim() || null,
      source: data.source ?? 'WEBSITE',
      targetClassId,
      notes: [
        `Student: ${data.studentName}`,
        `DOB: ${data.dob}`,
        `Target Class: ${data.targetClassName}`,
        data.message ? `Message: ${data.message}` : '',
      ].filter(Boolean).join('\n'),
    },
  })

  return NextResponse.json(
    { success: true, id: lead.id },
    { status: 201 },
  )
}
