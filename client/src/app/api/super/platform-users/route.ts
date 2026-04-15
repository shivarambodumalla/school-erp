import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const inviteSchema = z.object({
  email: z.string().email(),
  platformRoleId: z.string().min(1),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const users = await prisma.platformUser.findMany({
      select: {
        id: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        platformRole: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { email, platformRoleId } = parsed.data

    const existing = await prisma.platformUser.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const { generateTempPassword } = await import('@/lib/generate-password')
    const tempPassword = generateTempPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const user = await prisma.platformUser.create({
      data: {
        email,
        hashedPassword,
        platformRoleId,
      },
      select: { id: true, email: true },
    })

    await prisma.auditLog.create({
      data: {
        institutionId: session.user.institutionId,
        userId: session.user.id,
        action: 'PLATFORM_USER_INVITED',
        tableName: 'PlatformUser',
        recordId: user.id,
        after: { invitedEmail: email, roleId: platformRoleId },
      },
    })

    return NextResponse.json(
      { id: user.id, email: user.email, tempPassword },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}