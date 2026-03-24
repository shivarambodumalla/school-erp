'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

interface CreateRoleData {
    name: string
    description?: string
    masqueradeMode: 'DISABLED' | 'READ_ONLY' | 'FULL_ACCESS'
    permissions: string[]
}

export async function createPlatformRole(data: CreateRoleData) {
    await prisma.platformRole.create({
        data: {
            name: data.name,
            description: data.description,
            masqueradeMode: data.masqueradeMode,
            permissions: data.permissions,
        },
    })
    revalidatePath('/super/roles')
}

export async function updatePlatformRole(id: string, data: Partial<CreateRoleData>) {
    await prisma.platformRole.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            masqueradeMode: data.masqueradeMode,
            permissions: data.permissions,
        },
    })
    revalidatePath('/super/roles')
}

export async function deletePlatformRole(id: string) {
    const role = await prisma.platformRole.findUnique({ where: { id }, select: { isSystemRole: true } })
    if (role?.isSystemRole) throw new Error('Cannot delete system roles')
    await prisma.platformRole.delete({ where: { id } })
    revalidatePath('/super/roles')
}

export async function createPlatformUser(email: string, platformRoleId: string) {
    const tempPassword = 'TempPass@123'
    const hashedPassword = await bcrypt.hash(tempPassword, 12)
    await prisma.platformUser.create({
        data: { email, hashedPassword, platformRoleId },
    })
    revalidatePath('/super/users')
    return { tempPassword }
}

export async function deactivatePlatformUser(id: string) {
    await prisma.platformUser.update({ where: { id }, data: { isActive: false } })
    revalidatePath('/super/users')
}

export async function changePlatformUserRole(userId: string, roleId: string) {
    await prisma.platformUser.update({ where: { id: userId }, data: { platformRoleId: roleId } })
    revalidatePath('/super/users')
}
