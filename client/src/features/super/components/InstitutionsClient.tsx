'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search, Plus, ChevronRight, SlidersHorizontal,
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

const PLAN_OPTIONS = ['STARTER', 'GROWTH', 'PRO']
const STATUS_OPTIONS = ['active', 'suspended']

export function InstitutionsClient({ initialData }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [plans, setPlans] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<string[]>([])
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
    if (plans.length === 1) params.set('plan', plans[0])
    if (statusFilters.length === 1) params.set('status', statusFilters[0])
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
  }, [search, plans, statusFilters])

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

  const togglePlan = (p: string) => {
    setPlans(prev => prev.includes(p) ? prev.filter(v => v !== p) : [...prev, p])
  }

  const toggleStatusFilter = (s: string) => {
    setStatusFilters(prev => prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s])
  }

  const activeFilterCount = plans.length + statusFilters.length

  return (
    <div className="space-y-6">
      {/* Toolbar: Title left | Search + Filter + Add right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">Institutions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} school{total !== 1 ? 's' : ''} on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
              h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-48"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary
                    text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-0">
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-medium">Plan</p>
              </div>
              <div className="p-2 space-y-0.5">
                {PLAN_OPTIONS.map(p => (
                  <label key={p}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md
                      hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={plans.includes(p)}
                      onCheckedChange={() => togglePlan(p)}
                    />
                    <span className="text-sm">{p}</span>
                  </label>
                ))}
              </div>
              <div className="px-3 py-2.5 border-b border-t">
                <p className="text-sm font-medium">Status</p>
              </div>
              <div className="p-2 space-y-0.5">
                {STATUS_OPTIONS.map(s => (
                  <label key={s}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md
                      hover:bg-muted/50 cursor-pointer transition-colors capitalize">
                    <Checkbox
                      checked={statusFilters.includes(s)}
                      onCheckedChange={() => toggleStatusFilter(s)}
                    />
                    <span className="text-sm capitalize">{s}</span>
                  </label>
                ))}
              </div>
              {activeFilterCount > 0 && (
                <div className="px-3 py-2 border-t">
                  <button type="button" onClick={() => { setPlans([]); setStatusFilters([]) }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Clear all
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button onClick={() => setDrawerOpen(true)} className="min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-auto max-h-[calc(100vh-240px)]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-[1] bg-muted/95 backdrop-blur-sm">
              <tr className="border-b">
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
                  text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
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
                    cursor-pointer select-none hidden sm:table-cell"
                  onClick={() => handleSort('students')}
                >
                  <span className="flex items-center">
                    Students <SortIcon field="students" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none hidden sm:table-cell"
                  onClick={() => handleSort('users')}
                >
                  <span className="flex items-center">
                    Users <SortIcon field="users" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium
                    text-muted-foreground text-xs uppercase tracking-wide
                    cursor-pointer select-none hidden md:table-cell"
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
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
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
                      <td className="px-4 py-3 text-sm font-medium hidden sm:table-cell">
                        {inst._count.students.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium hidden sm:table-cell">
                        {inst._count.users}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
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
