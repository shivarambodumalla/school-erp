'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, GraduationCap, Users, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClassCard } from './ClassCard'
import { AddClassSheet } from './AddClassSheet'
import type { ClassTemplate } from '../types'

export function ClassesClient() {
  const { apiParam } = useInstitutionId()
  const [classes, setClasses] = useState<ClassTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/classes${apiParam}`)
      if (res.ok) {
        const data = (await res.json()) as ClassTemplate[]
        setClasses(data)
      }
    } catch {
      /* handled by empty state */
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const totalSections = classes.reduce(
    (sum, c) => sum + (c.activeYear?.sectionCount ?? 0), 0
  )
  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.activeYear?.studentCount ?? 0), 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
        <Button className="min-h-[44px]" onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Class
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<GraduationCap className="h-5 w-5" />}
          label="Total Classes" value={classes.length} loading={loading} />
        <StatCard icon={<LayoutGrid className="h-5 w-5" />}
          label="Total Sections" value={totalSections} loading={loading} />
        <StatCard icon={<Users className="h-5 w-5" />}
          label="Total Students" value={totalStudents} loading={loading} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center space-y-2">
          <p className="font-medium">No classes yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first class to get started.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <ClassCard key={cls.id} data={cls} />
          ))}
        </div>
      )}

      <AddClassSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={fetchClasses}
      />
    </div>
  )
}

function StatCard({ icon, label, value, loading }: {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary
        flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        {loading ? (
          <div className="h-6 w-10 rounded bg-muted animate-pulse" />
        ) : (
          <p className="text-xl font-bold">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
