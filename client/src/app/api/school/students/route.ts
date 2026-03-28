import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.portalType)) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    try {
        const institutionId = session.user.institutionId
        const url = new URL(req.url)
        const search = url.searchParams.get('search') ?? ''
        const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
        const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10)))

        const where: Record<string, unknown> = { institutionId }
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { admissionNo: { contains: search, mode: 'insensitive' } },
                { sisId: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                select: {
                    id: true,
                    serialNo: true,
                    firstName: true,
                    lastName: true,
                    admissionNo: true,
                    rollNo: true,
                    status: true,
                    photoUrl: true,
                    sections: {
                        where: { status: 'ACTIVE' },
                        select: {
                            section: {
                                select: {
                                    name: true,
                                    classYear: { select: { classTemplate: { select: { name: true } } } },
                                },
                            },
                        },
                        take: 1,
                    },
                },
                orderBy: { firstName: 'asc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.student.count({ where }),
        ])

        return NextResponse.json({ students, total })
    } catch (err) {
        console.error('GET /api/school/students error:', err)
        return NextResponse.json({ students: [], total: 0 }, { status: 500 })
    }
}
