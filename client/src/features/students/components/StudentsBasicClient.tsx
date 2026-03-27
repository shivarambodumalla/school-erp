'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Student {
  id: string
  firstName: string
  lastName: string
  admissionNo: string
  status: string
  class?: { name: string }
  section?: { name: string }
}

// Replace MOCK_STUDENTS with real API call when ready (Week 2):
// const res = await fetch('/api/school/students?search=${search}')
const MOCK_STUDENTS: Student[] = [
  {
    id: '1', firstName: 'Arjun', lastName: 'Sharma',
    admissionNo: 'ADM001', status: 'ACTIVE',
    class: { name: '8A' }, section: { name: 'A' },
  },
  {
    id: '2', firstName: 'Priya', lastName: 'Nair',
    admissionNo: 'ADM002', status: 'ACTIVE',
    class: { name: '9B' }, section: { name: 'B' },
  },
  {
    id: '3', firstName: 'Rahul', lastName: 'Verma',
    admissionNo: 'ADM003', status: 'INACTIVE',
    class: { name: '10A' }, section: { name: 'A' },
  },
]

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-red-500', 'bg-indigo-500',
]

function getInitials(f: string, l: string) {
  return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? 'bg-gray-500'
}

export function StudentsBasicClient() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Student | null>(null)

  const filtered = MOCK_STUDENTS.filter(s => {
    const q = search.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q)
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
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 min-h-[44px]"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center
              h-full text-sm text-muted-foreground">
              No students found
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
                  className={`h-9 w-9 rounded-full shrink-0
                    flex items-center justify-center text-white
                    text-xs font-bold ${getAvatarColor(s.firstName)}`}
                >
                  {getInitials(s.firstName, s.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.admissionNo}
                    {s.class && ` · ${s.class.name}`}
                    {s.section && ` ${s.section.name}`}
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
                className={`h-16 w-16 rounded-xl shrink-0
                  flex items-center justify-center text-white
                  text-xl font-bold ${getAvatarColor(selected.firstName)}`}
              >
                {getInitials(selected.firstName, selected.lastName)}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selected.admissionNo}
                  {selected.class && ` · Class ${selected.class.name}`}
                </p>
                <span
                  className={`inline-flex items-center mt-1
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${selected.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  {selected.status}
                </span>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Full student profile with attendance, fees, and grades
                will be available in Week 2 when the complete
                Students feature is built.
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
            <p className="font-medium">Select a student</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Click any student from the list to view their profile
            </p>
          </div>
        )}
      </div>
    </div>
  )
}