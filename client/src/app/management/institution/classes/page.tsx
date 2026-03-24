import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ClassesPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const classes = await prisma.class.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            name: true,
            gradeLevel: true,
            sections: { select: { id: true, name: true } },
            _count: { select: { sections: true } },
        },
        orderBy: { gradeLevel: 'asc' },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Classes</h1>
                <p className="text-muted-foreground text-sm mt-1">{classes.length} classes</p>
            </div>

            {classes.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
                    <p>No classes yet. Complete onboarding to add classes.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                        <div key={cls.id} className="rounded-xl border bg-card p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{cls.name}</p>
                                <span className="text-xs text-muted-foreground">Grade {cls.gradeLevel}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {cls.sections.map((sec) => (
                                    <span key={sec.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                        Section {sec.name}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{cls._count.sections} section{cls._count.sections !== 1 ? 's' : ''}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
