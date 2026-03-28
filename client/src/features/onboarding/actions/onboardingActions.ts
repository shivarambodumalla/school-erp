'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '@/server/auth'

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
    const session = await auth()
    if (!session || session.user.institutionId !== data.institutionId) return { error: 'Unauthorised' }

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
        // Create class templates + class years + sections
        const createdClasses: { classYearId: string; sectionId: string }[] = []
        for (const cls of data.classes) {
            if (!cls.name.trim()) continue
            const template = await tx.classTemplate.create({
                data: {
                    institutionId: data.institutionId,
                    name: cls.name,
                    gradeLevel: cls.gradeLevel,
                },
            })
            const classYear = await tx.classYear.create({
                data: {
                    institutionId: data.institutionId,
                    classTemplateId: template.id,
                    academicYearId,
                },
            })
            const section = await tx.section.create({
                data: {
                    classYearId: classYear.id,
                    institutionId: data.institutionId,
                    name: cls.sectionName,
                },
            })
            createdClasses.push({ classYearId: classYear.id, sectionId: section.id })
        }

        // Create staff users
        for (const member of data.staff) {
            if (!member.email.trim() || !member.firstName.trim()) continue
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
        const year = new Date().getFullYear()
        let studentSeq = 1
        for (const student of data.students) {
            if (!student.firstName.trim() || !student.admissionNo.trim()) continue
            const dob = new Date(student.dateOfBirth)
            if (isNaN(dob.getTime())) continue

            const sisId = `ONF-${year}-${String(studentSeq).padStart(5, '0')}`
            studentSeq++
            const created = await tx.student.create({
                data: {
                    institutionId: data.institutionId,
                    admissionNo: student.admissionNo,
                    sisId,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    dateOfBirth: dob,
                    gender: student.gender,
                    guardianName: student.guardianName,
                    guardianPhone: student.guardianPhone,
                },
            })

            // Link student to class/section via StudentSection
            const classYearId = firstClass?.classYearId ?? data.classId
            const sectionId = firstClass?.sectionId ?? ''
            if (classYearId && sectionId) {
                await tx.studentSection.create({
                    data: {
                        institutionId: data.institutionId,
                        studentId: created.id,
                        sectionId,
                        classYearId,
                        status: 'ACTIVE',
                    },
                })
            }
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
