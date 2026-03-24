'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function suspendInstitution(id: string, reason: string) {
    await prisma.institution.update({
        where: { id },
        data: { isActive: false, suspendedAt: new Date(), suspendedReason: reason },
    })
    revalidatePath('/super/institutions')
    revalidatePath(`/super/institutions/${id}`)
}

export async function reactivateInstitution(id: string) {
    await prisma.institution.update({
        where: { id },
        data: { isActive: true, suspendedAt: null, suspendedReason: null },
    })
    revalidatePath('/super/institutions')
    revalidatePath(`/super/institutions/${id}`)
}

export async function updateInstitutionPlan(id: string, plan: 'STARTER' | 'GROWTH' | 'PRO') {
    await prisma.institution.update({
        where: { id },
        data: { planTier: plan },
    })
    revalidatePath(`/super/institutions/${id}`)
}

export async function updateCustomPricing(id: string, amount: number) {
    await prisma.institution.update({
        where: { id },
        data: { customPricing: amount },
    })
    revalidatePath(`/super/institutions/${id}`)
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
