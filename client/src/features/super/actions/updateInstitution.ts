'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import {
  addInstitutionSchema,
  type AddInstitutionFormData,
} from '../schemas/institutionSchema'

export async function updateInstitution(
  institutionId: string,
  data: AddInstitutionFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorised' }
    }

    const parsed = addInstitutionSchema.safeParse(data)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Invalid data',
      }
    }

    const {
      name, subdomain, institutionType, board_affiliation,
      planTier, addressLine1, addressLine2, city, state,
      pinCode, phone, email, website,
      establishedYear, studentCapacity,
    } = parsed.data

    // Check subdomain uniqueness (excluding current)
    const existing = await prisma.institution.findFirst({
      where: {
        subdomain,
        NOT: { id: institutionId },
      },
      select: { id: true },
    })

    if (existing) {
      return {
        success: false,
        error: `Subdomain "${subdomain}" is already taken.`,
      }
    }

    await prisma.institution.update({
      where: { id: institutionId },
      data: {
        name,
        subdomain,
        institutionType,
        board: board_affiliation,
        planTier,
        addressLine1,
        addressLine2: addressLine2 ?? null,
        city,
        state,
        pinCode,
        phone,
        billingEmail: email,
        website: website ?? null,
        establishedYear: establishedYear ?? null,
        studentCapacity: studentCapacity ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        institutionId,
        userId: session.user.id,
        action: 'updated',
        tableName: 'Institution',
        recordId: institutionId,
        after: { name, subdomain, planTier, updatedBy: session.user.email },
      },
    })

    revalidatePath(`/super/institutions/${institutionId}`)
    revalidatePath(`/super/institutions`)

    return { success: true }
  } catch (err) {
    console.error('updateInstitution error:', err)
    return { success: false, error: 'Something went wrong.' }
  }
}
