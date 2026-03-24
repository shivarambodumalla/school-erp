import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function StaffPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const staff = await prisma.user.findMany({
        where: {
            institutionId: session.user.institutionId,
            portalType: { in: ['TEACHER', 'INSTRUCTOR'] },
        },
        select: {
            id: true,
            email: true,
            portalType: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Staff</h1>
                <p className="text-muted-foreground text-sm mt-1">{staff.length} staff members</p>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => (
                                <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{member.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{member.portalType}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            member.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {staff.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">No staff members yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}
