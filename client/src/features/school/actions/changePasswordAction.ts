'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export async function changePassword(
  data: ChangePasswordInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorised' }

    const parsed = changePasswordSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hashedPassword: true },
    })

    if (!user) return { success: false, error: 'User not found' }

    const match = await bcrypt.compare(parsed.data.currentPassword, user.hashedPassword)
    if (!match) return { success: false, error: 'Current password is incorrect' }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword: hashed },
    })

    return { success: true }
  } catch (err) {
    console.error('changePassword error:', err)
    return { success: false, error: 'Failed to change password. Please try again.' }
  }
}