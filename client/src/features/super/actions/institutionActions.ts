'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '@/server/auth'

export async function suspendInstitution(id: string, reason: string) {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') return { error: 'Unauthorised' }

    await prisma.institution.update({
        where: { id },
        data: { isActive: false, suspendedAt: new Date(), suspendedReason: reason },
    })
    revalidatePath('/super/institutions')
    revalidatePath(`/super/institutions/${id}`)
}

export async function reactivateInstitution(id: string) {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') return { error: 'Unauthorised' }

    await prisma.institution.update({
        where: { id },
        data: { isActive: true, suspendedAt: null, suspendedReason: null },
    })
    revalidatePath('/super/institutions')
    revalidatePath(`/super/institutions/${id}`)
}

export async function updateInstitutionPlan(id: string, plan: 'STARTER' | 'GROWTH' | 'PRO') {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') return { error: 'Unauthorised' }

    await prisma.institution.update({
        where: { id },
        data: { planTier: plan },
    })
    revalidatePath(`/super/institutions/${id}`)
}

export async function updateCustomPricing(id: string, amount: number) {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') return { error: 'Unauthorised' }

    await prisma.institution.update({
        where: { id },
        data: { customPricing: amount },
    })
    revalidatePath(`/super/institutions/${id}`)
}

export async function checkSubdomainAvailable(subdomain: string): Promise<boolean | { error: string }> {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') return { error: 'Unauthorised' }

    const existing = await prisma.institution.findUnique({
        where: { subdomain },
        select: { id: true },
    })
    return !existing
}

export async function createInstitution(data: {
    name: string
    subdomain: string
    board: 'CBSE' | 'ICSE' | 'STATE'
    planTier: 'STARTER' | 'GROWTH' | 'PRO'
    billingEmail?: string
    adminEmail: string
    adminPassword: string
}) {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') return { error: 'Unauthorised' }

    const hashedPassword = await bcrypt.hash(data.adminPassword, 12)
    const institution = await prisma.institution.create({
        data: {
            name: data.name,
            subdomain: data.subdomain,
            board: data.board,
            planTier: data.planTier,
            billingEmail: data.billingEmail,
            users: {
                create: {
                    email: data.adminEmail,
                    hashedPassword,
                    portalType: 'ADMIN',
                },
            },
        },
    })
    revalidatePath('/super/institutions')
    return institution
}
