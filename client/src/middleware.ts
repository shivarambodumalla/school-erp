/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */

import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/error']

export default auth((req) => {
    const { nextUrl } = req
    const session = req.auth

    // Subdomain resolution:
    // Production: stmarys.onflows.app → institutionId
    // Development: stmarys.localhost:3000 → institutionId

    const hostname = req.headers.get('host') ?? ''
    const subdomain = hostname
        .replace('.onflows.app', '')
        .replace('.localhost:3000', '')
        .split('.')[0]

    // In development default to 'stmarys' if no subdomain
    let resolvedSubdomain =
        hostname === 'localhost:3000' ? 'stmarys' : subdomain

    const isPublic =
        PUBLIC_ROUTES.includes(nextUrl.pathname) ||
        nextUrl.pathname.startsWith('/api/auth') ||
        nextUrl.pathname.startsWith('/api/health')

    // Not logged in → redirect to login
    if (!session && !isPublic) {
        const loginUrl = new URL('/auth/login', nextUrl.origin)
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Logged in + on login page → redirect to dashboard
    if (session && nextUrl.pathname === '/auth/login') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
    }

    // Super routes — only SUPER_ADMIN allowed
    if (nextUrl.pathname.startsWith('/super')) {
        if (!session || session.user.portalType !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
        }
    }

    // Management routes — SUPER_ADMIN should not be in management shell
    if (nextUrl.pathname.startsWith('/management')) {
        if (session?.user.portalType === 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/super/dashboard', nextUrl.origin))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
