'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

interface ClassInput {
    name: string
    gradeLevel: number
    sectionName: string
}

interface StaffInput {
    firstName: string
    lastName: string
    email: string
    portalType: 'TEACHER' | 'INSTRUCTOR'
    password: string
}

interface StudentInput {
    firstName: string
    lastName: string
    admissionNo: string
    dateOfBirth: string
    gender: 'MALE' | 'FEMALE' | 'OTHER'
    guardianName: string
    guardianPhone: string
}

interface OnboardingData {
    institutionId: string
    academicYearId?: string
    classes: ClassInput[]
    staff: StaffInput[]
    students: StudentInput[]
    classId: string
}

export async function completeOnboarding(data: OnboardingData) {
    const defaultYear = await prisma.academicYear.findFirst({
        where: { institutionId: data.institutionId, isCurrent: true },
        select: { id: true },
    })

    const academicYearId = defaultYear?.id ?? (await prisma.academicYear.create({
        data: {
            institutionId: data.institutionId,
            name: '2025-26',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2026-03-31'),
            isCurrent: true,
        },
    })).id

    await prisma.$transaction(async (tx) => {
        // Create classes + sections
        const createdClasses: { id: string; sectionId: string }[] = []
        for (const cls of data.classes) {
            const created = await tx.class.create({
                data: {
                    institutionId: data.institutionId,
                    academicYearId,
                    name: cls.name,
                    gradeLevel: cls.gradeLevel,
                },
            })
            const section = await tx.section.create({
                data: { classId: created.id, name: cls.sectionName },
            })
            createdClasses.push({ id: created.id, sectionId: section.id })
        }

        // Create staff users
        for (const member of data.staff) {
            const hashed = await bcrypt.hash(member.password, 12)
            await tx.user.create({
                data: {
                    institutionId: data.institutionId,
                    email: member.email,
                    hashedPassword: hashed,
                    portalType: member.portalType,
                },
            })
        }

        // Create students (assigned to first class + section)
        const firstClass = createdClasses[0]
        for (const student of data.students) {
            await tx.student.create({
                data: {
                    institutionId: data.institutionId,
                    admissionNo: student.admissionNo,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    dateOfBirth: new Date(student.dateOfBirth),
                    gender: student.gender,
                    classId: firstClass?.id ?? data.classId,
                    sectionId: firstClass?.sectionId ?? '',
                    guardianName: student.guardianName,
                    guardianPhone: student.guardianPhone,
                },
            })
        }

        // Mark onboarding complete
        await tx.onboardingStep.upsert({
            where: { institutionId: data.institutionId },
            update: {
                classesAdded: true,
                staffAdded: true,
                studentsAdded: true,
                completedAt: new Date(),
            },
            create: {
                institutionId: data.institutionId,
                classesAdded: true,
                staffAdded: true,
                studentsAdded: true,
                completedAt: new Date(),
            },
        })
    })

    revalidatePath('/management/dashboard')
}
