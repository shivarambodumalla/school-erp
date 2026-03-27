'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  pinCode: z.string().nullable(),
  establishedYear: z.number().int().min(1800).max(2100).nullable(),
  studentCapacity: z.number().int().min(0).nullable(),
})

export type UpdateDetailsInput = z.infer<typeof updateDetailsSchema>

export async function updateInstitutionDetails(
  data: UpdateDetailsInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorised' }
    if (session.user.portalType !== 'ADMIN') {
      return { success: false, error: 'Unauthorised' }
    }

    const parsed = updateDetailsSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
    }

    await prisma.institution.update({
      where: { id: session.user.institutionId },
      data: parsed.data,
    })

    revalidatePath('/management/settings')
    revalidatePath('/management/dashboard')
    return { success: true }
  } catch (err) {
    console.error('updateInstitutionDetails error:', err)
    return { success: false, error: 'Failed to save. Please try again.' }
  }
}