import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const adminUser = await prisma.user.findFirst({
      where: {
        institutionId: params.institutionId,
        portalType: 'ADMIN',
        isActive: true,
      },
      select: { id: true, email: true },
    })
    if (!adminUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ userId: adminUser.id, email: adminUser.email })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
