import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const VALID_MODES = ['DAILY', 'PERIOD', 'BOTH'] as const

export async function PATCH(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const body = await req.json() as { mode: string }

    if (!VALID_MODES.includes(body.mode as typeof VALID_MODES[number])) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be DAILY, PERIOD, or BOTH' },
        { status: 400 },
      )
    }

    const settings = await prisma.attendanceSettings.upsert({
      where: { institutionId },
      create: {
        institutionId,
        mode: body.mode as typeof VALID_MODES[number],
      },
      update: {
        mode: body.mode as typeof VALID_MODES[number],
      },
    })

    return NextResponse.json(settings)
  } catch (err) {
    console.error('PATCH attendance-mode error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
