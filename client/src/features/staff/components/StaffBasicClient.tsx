'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  designation: string
  status: string
  portalType: string
}

// Replace MOCK_STAFF with real API call when ready (Week 2):
// const res = await fetch('/api/school/staff')
const MOCK_STAFF: StaffMember[] = [
  {
    id: '1', firstName: 'Priya', lastName: 'Nair',
    employeeNo: 'EMP001', designation: 'Class Teacher',
    status: 'ACTIVE', portalType: 'TEACHER',
  },
  {
    id: '2', firstName: 'Raj', lastName: 'Kumar',
    employeeNo: 'EMP002', designation: 'Subject Teacher',
    status: 'ACTIVE', portalType: 'TEACHER',
  },
  {
    id: '3', firstName: 'Sunita', lastName: 'Devi',
    employeeNo: 'EMP003', designation: 'Principal',
    status: 'ACTIVE', portalType: 'ADMIN',
  },
]

import { generateColor, getInitials } from '@/lib/colors'

const PORTAL_BADGE: Record<string, string> = {
  ADMIN: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-indigo-100 text-indigo-700',
  INSTRUCTOR: 'bg-amber-100 text-amber-700',
}

export function StaffBasicClient() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<StaffMember | null>(null)

  const filtered = MOCK_STAFF.filter(s => {
    const q = search.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.employeeNo.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Left panel */}
      <div className="w-80 shrink-0 flex flex-col border rounded-xl overflow-hidden">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2
              -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 min-h-[44px]"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {filtered.length} member{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center
              h-full text-sm text-muted-foreground">
              No staff found
            </div>
          ) : (
            filtered.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                className={`w-full flex items-center gap-3 p-3
                  text-left hover:bg-muted/50 transition-colors
                  border-b last:border-0
                  ${selected?.id === s.id
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : ''
                  }`}
              >
                <div
                  className="h-9 w-9 rounded-full shrink-0
                    flex items-center justify-center text-gray-800
                    text-xs font-bold"
                  style={{ backgroundColor: generateColor(s.firstName) }}
                >
                  {getInitials(s.firstName, s.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.employeeNo} · {s.designation}
                  </p>
                </div>
                <span
                  className={`h-2 w-2 rounded-full shrink-0
                    ${s.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-400'}`}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 rounded-xl border overflow-hidden">
        {selected ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-xl shrink-0
                  flex items-center justify-center text-gray-800
                  text-xl font-bold"
                style={{ backgroundColor: generateColor(selected.firstName) }}
              >
                {getInitials(selected.firstName, selected.lastName)}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selected.employeeNo} · {selected.designation}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${selected.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {selected.status}
                  </span>
                  <span
                    className={`inline-flex items-center
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${PORTAL_BADGE[selected.portalType] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {selected.portalType}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Full staff profile with schedule, classes, and
                performance will be available in Week 2 when the
                complete Staff feature is built.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center
            justify-center gap-3 text-center p-8">
            <div className="h-12 w-12 rounded-full bg-muted
              flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">Select a staff member</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Click any staff member from the list to view their profile
            </p>
          </div>
        )}
      </div>
    </div>
  )
}