'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StaffOption {
  id: string; firstName: string; lastName: string; designation: string
}

interface Props {
  label: string
  staffList: StaffOption[]
  selectedId: string | null
  excludeId: string | null
  onSelect: (id: string | null) => void
}

export function StaffSelector({ label, staffList, selectedId, excludeId, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const available = useMemo(() => {
    let list = staffList.filter((s) => s.id !== excludeId)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q)
      )
    }
    return list
  }, [staffList, excludeId, query])

  const selected = staffList.find((s) => s.id === selectedId)

  if (selected) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
            {selected.firstName[0]}{selected.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selected.firstName} {selected.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{selected.designation}</p>
          </div>
          <button type="button" onClick={() => onSelect(null)}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted min-h-[44px] min-w-[44px]">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search staff..." className="pl-9" />
      </div>
      <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No staff found</p>
        ) : available.map((s) => (
          <button key={s.id} type="button" onClick={() => { onSelect(s.id); setQuery('') }}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left min-h-[44px]">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
              {s.firstName[0]}{s.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{s.firstName} {s.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{s.designation}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
