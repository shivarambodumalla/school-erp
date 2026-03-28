'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const themeSchema = z.object({
  institutionId: z.string(),
  primaryColor: z.string().regex(
    /^#[0-9a-fA-F]{6}$/,
    'Invalid hex color'
  ),
  secondaryColor: z.string().regex(
    /^#[0-9a-fA-F]{6}$/,
    'Invalid hex color'
  ),
  logoUrl: z.string().nullable(),
  squareLogoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  themePalette: z.string(),
  darkPalette: z.string(),
})

export async function saveTheme(
  data: z.infer<typeof themeSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorised' }

    const isSuperAdmin = session.user.portalType === 'SUPER_ADMIN'
    const isSchoolAdmin =
      session.user.portalType === 'ADMIN' &&
      session.user.institutionId === data.institutionId

    if (!isSuperAdmin && !isSchoolAdmin) {
      return { success: false, error: 'Unauthorised' }
    }

    const parsed = themeSchema.safeParse(data)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? 'Invalid theme data',
      }
    }

    let parsedTheme: object
    let parsedDark: object
    try {
      parsedTheme = JSON.parse(data.themePalette) as object
      parsedDark = JSON.parse(data.darkPalette) as object
    } catch {
      return { success: false, error: 'Invalid theme palette JSON' }
    }

    await prisma.institution.update({
      where: { id: data.institutionId },
      data: {
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logoUrl: data.logoUrl,
        squareLogoUrl: data.squareLogoUrl,
        faviconUrl: data.faviconUrl,
        themePalette: parsedTheme,
        darkPalette: parsedDark,
        themeAppliedAt: new Date(),
      },
    })

    await prisma.auditLog.create({
      data: {
        institutionId: data.institutionId,
        userId: session.user.id,
        action: 'THEME_UPDATED',
        tableName: 'Institution',
        recordId: data.institutionId,
        after: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          appliedBy: session.user.email,
          appliedAt: new Date().toISOString(),
        },
      },
    })

    revalidatePath(`/super/institutions/${data.institutionId}`)
    revalidatePath(`/management/settings/branding`)
    revalidatePath(`/management`, 'layout')

    return { success: true }
  } catch (err) {
    console.error('saveTheme error:', err)
    return {
      success: false,
      error: 'Failed to save theme. Please try again.',
    }
  }
}
