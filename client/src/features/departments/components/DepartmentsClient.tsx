'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, LayoutGrid, List, Building2, Users, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Department, DepartmentStatus, ViewMode } from '../types'
import { DepartmentGridCard } from './DepartmentGridCard'
import { DepartmentListRow } from './DepartmentListRow'
import { DeptOrgChartModal } from './DeptOrgChartModal'

export function DepartmentsClient() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<DepartmentStatus>('ALL')
  const [orgChartDept, setOrgChartDept] = useState<Department | null>(null)
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/school/departments')
      if (res.ok) setDepartments((await res.json()) as Department[])
    } catch {
      toast.error('Failed to load departments')
    }
    setLoading(false)
  }, [])
  useEffect(() => { fetchDepartments() }, [fetchDepartments])
  const filtered = useMemo(() => {
    let list = departments
    if (statusFilter !== 'ALL') list = list.filter((d) => d.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.hod?.firstName.toLowerCase().includes(q) ||
        d.hod?.lastName.toLowerCase().includes(q)
      )
    }
    return list
  }, [departments, statusFilter, search])
  const totalStaff = departments.reduce((s, d) => s + d._count.staff, 0)
  const activeCount = departments.filter((d) => d.status === 'ACTIVE').length
  const handleDelete = async (dept: Department) => {
    if (dept._count.staff > 0) { toast.error('Cannot delete a department with assigned staff'); return }
    if (!window.confirm(`Delete "${dept.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/school/departments/${dept.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success(`"${dept.name}" deleted`); fetchDepartments() }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to delete department') }
  }
  const handleToggleStatus = async (dept: Department) => {
    const ns = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const res = await fetch(`/api/school/departments/${dept.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: ns }),
      })
      if (res.ok) { toast.success(`"${dept.name}" ${ns.toLowerCase()}`); fetchDepartments() }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to update department') }
  }
  const filters: { label: string; value: DepartmentStatus }[] =
    [{ label: 'All', value: 'ALL' }, { label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage academic and administrative departments</p>
        </div>
        <Button onClick={() => router.push('/management/departments/new')} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Building2} label="Total Departments" value={departments.length} />
        <StatCard icon={Users} label="Total Staff" value={totalStaff} />
        <StatCard icon={CheckCircle2} label="Active Departments" value={activeCount} />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors min-h-[44px]
                ${statusFilter === f.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>
              {f.label}
            </button>
          ))}
          <div className="ml-2 flex items-center border rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${view === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Building2 className="h-12 w-12" />
          <p className="font-medium text-foreground">No departments yet</p>
          <p className="text-sm">Create your first department to get started</p>
          <Button onClick={() => router.push('/management/departments/new')} variant="outline" className="gap-1.5 mt-2">
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <DepartmentGridCard key={dept.id} department={dept} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onViewOrgChart={setOrgChartDept} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border divide-y">
          {filtered.map((dept) => (
            <DepartmentListRow key={dept.id} department={dept} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onViewOrgChart={setOrgChartDept} />
          ))}
        </div>
      )}

      <DeptOrgChartModal department={orgChartDept} isOpen={!!orgChartDept} onClose={() => setOrgChartDept(null)} />
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </div>
  )
}
