import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
    DEFAULT_ROLE_PERMISSIONS,
    type Permission
} from '@/lib/permissions'

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
                token.logoUrl = user.logoUrl
                token.permissions = user.permissions
            }
            return token
        },

        async session({ session, token }) {
            session.user.id = token.id
            session.user.portalType = token.portalType
            session.user.institutionId = token.institutionId
            session.user.institutionName = token.institutionName
            session.user.institutionSubdomain = token.institutionSubdomain
            session.user.primaryColor = token.primaryColor
            session.user.logoUrl = token.logoUrl
            session.user.permissions = token.permissions
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
