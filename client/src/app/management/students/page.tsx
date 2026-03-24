import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function StudentsPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const students = await prisma.student.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            status: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Students</h1>
                <p className="text-muted-foreground text-sm mt-1">{students.length} students enrolled</p>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Admission No</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{student.firstName} {student.lastName}</td>
                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{student.admissionNo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            student.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">No students yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}
