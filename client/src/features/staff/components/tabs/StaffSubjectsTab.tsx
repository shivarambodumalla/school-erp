'use client'

import { BookOpen, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { StaffDetail } from '../../types'

export function StaffSubjectsTab({ staff }: { staff: StaffDetail }) {
  if (staff.subjectTeaching.length === 0 && staff.classTeaching.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No subjects assigned yet</p>
      </div>
    )
  }

  // Group subjects by class template name
  const grouped = new Map<string, typeof staff.subjectTeaching>()
  for (const st of staff.subjectTeaching) {
    const key = st.subject.classYear.classTemplate.name
    const list = grouped.get(key) ?? []
    list.push(st)
    grouped.set(key, list)
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Class Teacher Assignments */}
      {staff.classTeaching.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Class Teacher Assignments</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {staff.classTeaching.map(ct => (
              <div key={ct.id} className="rounded-xl border p-4">
                <p className="font-medium">Section {ct.section.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ct.academicYear.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Teaching */}
      {Array.from(grouped.entries()).map(([className, subjects]) => (
        <div key={className}>
          <h3 className="font-semibold mb-3">{className}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map(st => (
              <div key={st.id} className="rounded-xl border p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{st.subject.name}</p>
                  {st.isPrimary && (
                    <Badge variant="secondary" className="mt-1">
                      <Star className="h-3 w-3 mr-1" /> Primary
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
