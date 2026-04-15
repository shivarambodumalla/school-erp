import type { NextAuthConfig } from 'next-auth'
import type { Permission } from '@/lib/permissions'

// Edge-compatible auth config (no bcryptjs, no prisma).
// Used by middleware. The full config (auth.ts) is used by API routes.
export const authConfig = {
    providers: [],
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string
                token.portalType = user.portalType
                token.institutionId = user.institutionId
                token.institutionName = user.institutionName
                token.institutionSubdomain = user.institutionSubdomain
                token.primaryColor = user.primaryColor
                token.secondaryColor = user.secondaryColor
                token.themePalette = user.themePalette
                token.darkPalette = user.darkPalette
                token.logoUrl = user.logoUrl
                token.permissions = user.permissions
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id as string
            session.user.portalType = token.portalType as string
            session.user.institutionId = token.institutionId as string
            session.user.institutionName = token.institutionName as string
            session.user.institutionSubdomain = token.institutionSubdomain as string
            session.user.primaryColor = token.primaryColor as string
            session.user.secondaryColor = token.secondaryColor as string | undefined
            session.user.themePalette = token.themePalette as Record<string, string> | undefined
            session.user.darkPalette = token.darkPalette as Record<string, string> | undefined
            session.user.logoUrl = token.logoUrl as string | undefined
            session.user.permissions = token.permissions as Permission[]
            return session
        },
    },
} satisfies NextAuthConfig
