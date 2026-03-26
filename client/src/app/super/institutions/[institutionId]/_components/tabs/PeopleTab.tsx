'use client'

import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { ROLE_COLORS } from '@/lib/colors'

interface UserRow {
  id: string
  email: string
  portalType: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface BreakdownRow {
  portalType: string
  _count: number
  lastLogin: string | null
}

interface PeopleData {
  total: number
  active: number
  inactive: number
  breakdown: BreakdownRow[]
  users: UserRow[]
}

interface Props { institutionId: string; apiBase: string }

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}
            className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-muted animate-pulse" />
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center
      py-16 gap-3">
      <div className="h-12 w-12 rounded-full bg-muted flex
        items-center justify-center">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-semibold">No users yet</p>
      <p className="text-sm text-muted-foreground">
        This institution has no user accounts.
      </p>
    </div>
  )
}

export function PeopleTab({ institutionId, apiBase }: Props) {
  const [data, setData] = useState<PeopleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/people`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        setData(d as PeopleData)
        setLoading(false)
      })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(true)
        setLoading(false)
      })
    return () => controller.abort()
  }, [apiBase])

  if (loading) return <Skeleton />
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50
        p-6 text-center text-red-700 text-sm">
        Failed to load people data. Please refresh.
      </div>
    )
  }
  if (data.total === 0) return <EmptyState />

  const filtered = data.users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch =
      u.email.toLowerCase().includes(q) ||
      u.portalType.toLowerCase().includes(q)
    const matchRole =
      roleFilter === 'ALL' || u.portalType === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={String(data.total)}
          icon={Users} color="blue" />
        <StatCard label="Active" value={String(data.active)}
          icon={UserCheck} color="green" />
        <StatCard label="Inactive" value={String(data.inactive)}
          icon={UserX} color="red" />
        <StatCard label="Role Types"
          value={String(data.breakdown.length)}
          icon={Clock} color="amber" />
      </div>

      {/* Last login per role */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3">Last Login by Role</h3>
        <div className="divide-y">
          {data.breakdown.map(b => (
            <div key={b.portalType}
              className="flex items-center justify-between py-2.5">
              <span className={`inline-flex items-center px-2.5 py-1
                rounded-full text-xs font-medium
                ${ROLE_COLORS[b.portalType] ??
                  'bg-gray-100 text-gray-600'}`}>
                {b.portalType}
              </span>
              <div className="text-right">
                <p className="text-sm font-medium">{b._count} users</p>
                <p className="text-xs text-muted-foreground">
                  Last:{' '}
                  {b.lastLogin
                    ? new Date(b.lastLogin).toLocaleDateString('en-IN')
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col sm:flex-row items-start
          sm:items-center justify-between gap-3 p-4 border-b">
          <div>
            <h3 className="font-semibold">All Users</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {data.total} users
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 rounded-md border border-input
                bg-background px-3 text-sm w-full sm:w-56
                focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-9 rounded-md border border-input
                bg-background px-3 text-sm"
            >
              {['ALL', 'ADMIN', 'TEACHER', 'STUDENT',
                'PARENT', 'INSTRUCTOR'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {['Email', 'Role', 'Status',
                  'Last Login', 'Joined'].map(h => (
                  <th key={h}
                    className="text-left px-4 py-3 font-medium
                      text-muted-foreground text-xs uppercase
                      tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}
                    className="text-center py-12 text-muted-foreground
                      text-sm">
                    No users match your search
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id}
                    className="border-b last:border-0 hover:bg-muted/20
                      transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${ROLE_COLORS[user.portalType] ??
                          'bg-gray-100 text-gray-600'}`}>
                        {user.portalType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt)
                          .toLocaleDateString('en-IN')
                        : 'Never'
                      }
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(user.createdAt)
                        .toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
