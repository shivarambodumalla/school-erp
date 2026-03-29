import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const transferSchema = z.object({
    exitType: z.enum(['TRANSFER', 'GRADUATED', 'WITHDRAWN', 'OTHER']),
    exitDate: z.string(),
    destinationSchool: z.string().optional(),
    reason: z.string().optional(),
    documentsToGenerate: z.array(z.string()),
})

export async function POST(
    req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId },
        select: { id: true, status: true, firstName: true, lastName: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (student.status !== 'ACTIVE') {
        return NextResponse.json(
            { error: 'Student is not active. Cannot process transfer.' },
            { status: 400 },
        )
    }

    const body = await req.json()
    const parsed = transferSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { exitType, exitDate, destinationSchool, reason, documentsToGenerate } = parsed.data

    const newStatus = exitType === 'GRADUATED' ? 'INACTIVE' : 'TRANSFERRED'

    const [exit] = await prisma.$transaction([
        prisma.studentExit.create({
            data: {
                studentId: params.studentId,
                exitType: exitType as 'TRANSFER' | 'GRADUATED' | 'WITHDRAWN' | 'OTHER',
                exitDate: new Date(exitDate),
                destinationSchool: destinationSchool ?? null,
                reason: reason ?? null,
                processedById: ctx.userId,
            },
        }),
        prisma.student.update({
            where: { id: params.studentId },
            data: { status: newStatus },
        }),
    ])

    await prisma.auditLog.create({
        data: {
            institutionId,
            userId: ctx.userId,
            action: 'STUDENT_TRANSFERRED',
            tableName: 'Student',
            recordId: params.studentId,
            after: {
                exitType,
                exitDate,
                destinationSchool,
                studentName: `${student.firstName} ${student.lastName}`,
            },
        },
    })

    return NextResponse.json({
        exitId: exit.id,
        studentId: params.studentId,
        exitType,
        documentsGenerated: documentsToGenerate,
    })
}
