'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const HASH_ROUNDS = 12

const schema = z.object({
    userId: z.string(),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
}).refine(
    data => data.newPassword === data.confirmPassword,
    { message: 'Passwords do not match', path: ['confirmPassword'] }
)

interface ChangePasswordInput {
    userId: string
    newPassword: string
    confirmPassword: string
}

interface ChangePasswordResult {
    success: boolean
    error?: string
}

export async function changePassword(
    formData: ChangePasswordInput
): Promise<ChangePasswordResult> {
    // Only admin or super admin can do this
    const session = await auth()
    if (!session || (session.user.portalType !== 'ADMIN' && session.user.portalType !== 'SUPER_ADMIN')) {
        return { success: false, error: 'Unauthorised' }
    }

    const parsed = schema.safeParse(formData)
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]
        return { success: false, error: firstError?.message ?? 'Invalid input' }
    }

    const { userId, newPassword } = parsed.data

    // Make sure user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })
    if (!user) return { success: false, error: 'User not found' }

    // Verify institution access
    // Super admin can change any user's password
    // Admin can only change passwords within their institution
    if (
        session.user.portalType !== 'SUPER_ADMIN' &&
        user.institutionId !== session.user.institutionId
    ) {
        return { success: false, error: 'Unauthorised' }
    }

    // Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, HASH_ROUNDS)
    await prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
    })

    // Log the action
    await prisma.auditLog.create({
        data: {
            institutionId: user.institutionId,
            userId: session.user.id,
            action: 'PASSWORD_CHANGED',
            tableName: 'User',
            recordId: userId,
            after: { changedBy: session.user.email },
        },
    })

    return { success: true }
}
