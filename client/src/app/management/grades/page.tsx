import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default async function GradesPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const institutionId = session.user.institutionId

  const classYears = await prisma.classYear.findMany({
    where: { institutionId, status: 'ACTIVE' },
    include: {
      classTemplate: { select: { name: true } },
      subjects: {
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { classTemplate: { gradeLevel: 'asc' } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Grades
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter and view student exam results
        </p>
      </div>

      {classYears.length === 0 ? (
        <div className="rounded-xl border bg-card p-12
          text-center">
          <GraduationCap className="mx-auto h-10 w-10
            text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No active classes found. Create classes first.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classYears.map((cy) => (
            <div
              key={cy.id}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {cy.classTemplate.name}
                </h3>
                <Link
                  href={`/management/institution/classes/${cy.id}/gradebook`}
                  className="text-sm text-primary
                    hover:underline min-h-[44px]
                    flex items-center"
                >
                  Class View
                </Link>
              </div>
              <div className="space-y-1">
                {cy.subjects.map((s) => (
                  <Link
                    key={s.id}
                    href={`/management/subjects/${s.id}/gradebook`}
                    className="flex items-center text-sm px-3 py-2
                      rounded-lg hover:bg-muted
                      transition-colors min-h-[44px]"
                  >
                    {s.name}
                  </Link>
                ))}
                {cy.subjects.length === 0 && (
                  <p className="text-xs text-muted-foreground
                    px-3 py-2">
                    No subjects yet
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
