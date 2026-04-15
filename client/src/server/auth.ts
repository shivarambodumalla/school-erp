import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { type Permission } from '@/lib/permissions'
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/defaultRoles'
import { authConfig } from './auth.config'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
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
})
