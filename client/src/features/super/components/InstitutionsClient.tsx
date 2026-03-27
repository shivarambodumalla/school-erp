'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search, Plus, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import { PLAN_COLORS } from '@/lib/colors'
import { AddInstitutionDrawer } from
  '@/app/super/institutions/_components/AddInstitutionDrawer'

interface Institution {
  id: string
  name: string
  subdomain: string
  board: string
  planTier: string
  isActive: boolean
  suspendedAt: string | null
  createdAt: string
  primaryColor: string
  logoUrl: string | null
  _count: { students: number; users: number }
}

type SortField = 'name' | 'planTier' | 'createdAt' | 'students' | 'users'
type SortDir = 'asc' | 'desc'

interface Props {
  initialData: {
    institutions: Institution[]
    total: number
    page: number
    totalPages: number
  }
}

export function InstitutionsClient({ initialData }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [institutions, setInstitutions] =
    useState<Institution[]>(initialData.institutions)
  const [total, setTotal] = useState(initialData.total)
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (planFilter !== 'ALL') params.set('plan', planFilter)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    try {
      const res = await fetch(`/api/super/institutions?${params}`)
      const data = await res.json() as {
        institutions: Institution[]
        total: number
      }
      setInstitutions(data.institutions)
      setTotal(data.total)
    } catch {
      // keep existing data on error
    }
    setLoading(false)
  }, [search, planFilter, statusFilter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 300)
    return () => clearTimeout(timer)
  }, [fetchData])

  const sorted = [...institutions].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    if (sortField === 'students') {
      av = a._count.students; bv = b._count.students
    } else if (sortField === 'users') {
      av = a._count.users; bv = b._count.users
    } else {
      av = a[sortField] ?? ''; bv = b[sortField] ?? ''
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av
    }
    const r = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? r : -r
  })

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    }
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const PLANS = ['ALL', 'STARTER', 'GROWTH', 'PRO']
  const STATUSES = ['ALL', 'active', 'suspended']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Institutions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} school{total !== 1 ? 's' : ''} on the platform
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Add Institution
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
            h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or subdomain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PLANS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                border transition-colors min-h-[32px]
                ${planFilter === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                border transition-colors capitalize min-h-[32px]
                ${statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center">
                    Institution <SortIcon field="name" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-medium
                  text-muted-foreground text-xs uppercase tracking-wide">
                  Board
                </th>
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none"
                  onClick={() => handleSort('planTier')}
                >
                  <span className="flex items-center">
                    Plan <SortIcon field="planTier" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none"
                  onClick={() => handleSort('students')}
                >
                  <span className="flex items-center">
                    Students <SortIcon field="students" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none"
                  onClick={() => handleSort('users')}
                >
                  <span className="flex items-center">
                    Users <SortIcon field="users" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <span className="flex items-center">
                    Joined <SortIcon field="createdAt" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-medium
                  text-muted-foreground text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-muted-foreground"
                  >
                    No institutions found
                  </td>
                </tr>
              ) : (
                sorted.map(inst => {
                  const initials = inst.name
                    .split(' ')
                    .slice(0, 2)
                    .map(w => w[0])
                    .join('')
                    .toUpperCase()
                  return (
                    <tr
                      key={inst.id}
                      className="border-b last:border-0
                        hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/super/institutions/${inst.id}`)
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {inst.logoUrl ? (
                            <img
                              src={inst.logoUrl}
                              alt={inst.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              className="h-8 w-8 rounded-lg flex
                                items-center justify-center text-white
                                text-xs font-bold shrink-0"
                              style={{ backgroundColor: inst.primaryColor }}
                            >
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {inst.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {inst.subdomain}.onflows.app
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {inst.board}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${PLAN_COLORS[inst.planTier] ??
                              'bg-gray-100 text-gray-600'}`}
                        >
                          {inst.planTier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {inst._count.students.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {inst._count.users}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(inst.createdAt).toLocaleDateString(
                          'en-IN',
                          { day: '2-digit', month: 'short', year: 'numeric' }
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center
                            gap-1 px-2 py-0.5 rounded-full text-xs
                            font-medium
                            ${inst.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full
                              ${inst.isActive
                                ? 'bg-green-500'
                                : 'bg-red-500'
                              }`}
                          />
                          {inst.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddInstitutionDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) void fetchData()
        }}
      />
    </div>
  )
}