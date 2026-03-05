import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/error']

export default auth((req) => {
    const { nextUrl } = req
    const session = req.auth

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

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
