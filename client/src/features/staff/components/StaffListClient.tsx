'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, UserX, ChevronLeft, ChevronRight,
  LayoutList, LayoutGrid,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddStaffSheet } from './AddStaffSheet'
import type { StaffListItem } from '../types'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
]

function getColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? 'bg-gray-500'
}

function getInitials(f: string, l: string) {
  return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
}

type ViewMode = 'table' | 'cards'

export function StaffListClient() {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const [sheetOpen, setSheetOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / 20))

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    params.set('page', String(page))
    const res = await fetch(`/api/school/staff?${params}`)
    if (res.ok) {
      const data = await res.json() as {
        staff: StaffListItem[]; total: number
      }
      setStaff(data.staff)
      setTotal(data.total)
    }
    setLoading(false)
  }, [search, status, page])

  useEffect(() => {
    const t = setTimeout(fetchStaff, 300)
    return () => clearTimeout(t)
  }, [fetchStaff])

  useEffect(() => { setPage(1) }, [search, status])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Staff ({total})
        </h1>
        <Button onClick={() => setSheetOpen(true)} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" /> Add Staff
        </Button>
      </div>

      <StaffFilters
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        view={view}
        onView={setView}
      />

      {loading ? (
        <LoadingSkeleton view={view} />
      ) : staff.length === 0 ? (
        <EmptyState search={search} />
      ) : view === 'table' ? (
        <StaffTable staff={staff} onRowClick={(id) => router.push(`/management/staff/${id}`)} />
      ) : (
        <StaffCards staff={staff} onCardClick={(id) => router.push(`/management/staff/${id}`)} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} staff)
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9"
              disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9"
              disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AddStaffSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCreated={fetchStaff}
      />
    </div>
  )
}

function StaffFilters({ search, onSearch, status, onStatus, view, onView }: {
  search: string; onSearch: (v: string) => void
  status: string; onStatus: (v: string) => void
  view: ViewMode; onView: (v: ViewMode) => void
}) {
  const statuses = ['', 'ACTIVE', 'INACTIVE', 'ON_LEAVE']
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search}
          onChange={e => onSearch(e.target.value)}
          className="pl-9 w-52 min-h-[44px]" />
      </div>
      {statuses.map(s => (
        <Button key={s || 'ALL'} variant={status === s ? 'default' : 'outline'}
          size="sm" className="min-h-[44px]"
          onClick={() => onStatus(s)}>
          {s || 'All'}
        </Button>
      ))}
      <div className="ml-auto flex gap-1">
        <Button variant={view === 'table' ? 'default' : 'outline'} size="icon"
          className="h-9 w-9" onClick={() => onView('table')}>
          <LayoutList className="h-4 w-4" />
        </Button>
        <Button variant={view === 'cards' ? 'default' : 'outline'} size="icon"
          className="h-9 w-9" onClick={() => onView('cards')}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function StaffTable({ staff, onRowClick }: {
  staff: StaffListItem[]; onRowClick: (id: string) => void
}) {
  return (
    <div className="rounded-xl border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="text-left px-4 py-3 font-medium">Employee</th>
            <th className="text-left px-4 py-3 font-medium">No</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Designation</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Dept</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Role</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} onClick={() => onRowClick(s.id)}
              className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center
                    text-white text-xs font-bold ${getColor(s.firstName)}`}>
                    {getInitials(s.firstName, s.lastName)}
                  </div>
                  <span className="font-medium">{s.firstName} {s.lastName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.employeeNo}</td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.designation}</td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                {s.department?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                {s.primaryRole?.name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary"
                  className={STATUS_COLORS[s.status] ?? ''}>
                  {s.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StaffCards({ staff, onCardClick }: {
  staff: StaffListItem[]; onCardClick: (id: string) => void
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map(s => (
        <button key={s.id} type="button" onClick={() => onCardClick(s.id)}
          className="rounded-xl border p-4 text-left hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full shrink-0 flex items-center justify-center
              text-white text-sm font-bold ${getColor(s.firstName)}`}>
              {getInitials(s.firstName, s.lastName)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
              <p className="text-sm text-muted-foreground truncate">{s.designation}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{s.department?.name ?? '-'}</span>
            <Badge variant="secondary" className={STATUS_COLORS[s.status] ?? ''}>
              {s.status}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}

function LoadingSkeleton({ view }: { view: ViewMode }) {
  if (view === 'cards') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div className="rounded-xl border divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <UserX className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No staff found</p>
      <p className="text-sm text-muted-foreground">
        {search ? 'Try a different search term' : 'Add your first staff member'}
      </p>
    </div>
  )
}
