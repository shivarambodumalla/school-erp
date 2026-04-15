import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  schoolName: z.string().min(2, 'School name is required').max(200),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required').max(20),
  schoolSize: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const created = await prisma.marketingLead.create({
    data: {
      ...parsed.data,
      source: 'GET_STARTED_BUTTON',
    },
    select: { id: true, createdAt: true },
  })

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
}
