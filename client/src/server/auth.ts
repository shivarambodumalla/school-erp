import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { type Permission } from '@/lib/permissions'
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/defaultRoles'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password } = parsed.data

                const user = await prisma.user.findFirst({
                    where: { email, isActive: true },
                    include: { institution: true },
                })

                if (!user) return null

                const passwordMatch = await bcrypt.compare(
                    password,
                    user.hashedPassword
                )
                if (!passwordMatch) return null

                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                })

                // Resolve permissions for this user's portal type
                // In future: fetch custom role permissions from DB
                // For now: use default permissions for portal type
                const permissions: Permission[] =
                    DEFAULT_ROLE_PERMISSIONS[user.portalType] ?? []

                return {
                    id: user.id,
                    email: user.email,
                    portalType: user.portalType,
                    institutionId: user.institutionId,
                    institutionName: user.institution.name,
                    institutionSubdomain: user.institution.subdomain,
                    primaryColor: user.institution.primaryColor,
                    secondaryColor: user.institution.secondaryColor ?? undefined,
                    themePalette: user.institution.themePalette as Record<string, string> | undefined,
                    darkPalette: user.institution.darkPalette as Record<string, string> | undefined,
                    logoUrl: user.institution.logoUrl ?? undefined,
                    permissions,
                }
            },
        }),
    ],

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

    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
})
