'use client'

import { useCallback, useState } from 'react'
import { ChevronDown, Check, Calendar } from 'lucide-react'
import { useAcademicYear } from '@/lib/academic-year-context'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function AcademicYearSwitcher() {
  const { selectedYearId, selectedYear, setSelectedYearId, allYears, loading } =
    useAcademicYear()
  const [open, setOpen] = useState(false)

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedYearId(id)
      setOpen(false)
    },
    [setSelectedYearId],
  )

  if (loading || allYears.length === 0) {
    return (
      <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg
            text-sm font-medium border border-input bg-background
            hover:bg-muted transition-colors min-h-[44px]
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Switch academic year"
        >
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <span className="truncate max-w-[100px]">
            {selectedYear?.name ?? 'Select year'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-56 p-1"
        sideOffset={8}
      >
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Academic Year
        </p>
        <div className="max-h-64 overflow-y-auto">
          {allYears.map((year) => {
            const isSelected = year.id === selectedYearId
            return (
              <button
                key={year.id}
                type="button"
                onClick={() => handleSelect(year.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5
                  rounded-md text-sm transition-colors min-h-[44px]
                  ${isSelected
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                  }`}
              >
                <span className="flex-1 text-left">{year.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {year.isCurrent ? (
                    <span className="inline-flex items-center rounded-full
                      bg-green-100 dark:bg-green-900/30 px-2 py-0.5
                      text-[10px] font-semibold text-green-700
                      dark:text-green-400">
                      Current
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full
                      bg-gray-100 dark:bg-gray-800 px-2 py-0.5
                      text-[10px] font-semibold text-gray-500
                      dark:text-gray-400">
                      Archived
                    </span>
                  )}
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
