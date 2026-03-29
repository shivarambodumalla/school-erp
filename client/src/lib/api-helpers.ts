import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'

export type ApiContext = {
  institutionId: string
  portalType: string
  userId: string
}

export async function getSchoolContext(
  req: Request,
  allowedRoles: string[] = ['ADMIN']
): Promise<ApiContext | NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorised' }, { status: 401 }
    )
  }

  const { portalType, institutionId, id: userId } = session.user

  // Super admin can access any institution via ?iid= param
  if (portalType === 'SUPER_ADMIN') {
    const url = new URL(req.url)
    const iid = url.searchParams.get('iid')
    if (!iid) {
      return NextResponse.json(
        { error: 'iid param required for SUPER_ADMIN' },
        { status: 400 }
      )
    }
    return { institutionId: iid, portalType, userId }
  }

  if (!allowedRoles.includes(portalType)) {
    return NextResponse.json(
      { error: 'Forbidden' }, { status: 403 }
    )
  }

  return { institutionId, portalType, userId }
}

export function isApiError(
  result: ApiContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
