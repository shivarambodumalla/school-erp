'use client'

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

export type SortDir = 'asc' | 'desc' | null

interface SortableHeaderProps {
  label: string
  field: string
  currentField: string | null
  currentDir: SortDir
  onSort: (field: string) => void
  className?: string
}

/**
 * Sortable table header cell.
 * Click toggles: asc → desc → null (reset).
 */
export function SortableHeader({
  label,
  field,
  currentField,
  currentDir,
  onSort,
  className = '',
}: SortableHeaderProps) {
  const isActive = currentField === field

  return (
    <th
      className={`text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && currentDir === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : isActive && currentDir === 'desc' ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </span>
    </th>
  )
}

/**
 * Hook helper: toggles sort state.
 * asc → desc → null (reset)
 */
export function toggleSort(
  field: string,
  currentField: string | null,
  currentDir: SortDir,
): { field: string | null; dir: SortDir } {
  if (currentField !== field) return { field, dir: 'asc' }
  if (currentDir === 'asc') return { field, dir: 'desc' }
  return { field: null, dir: null }
}

/**
 * Client-side sort helper for arrays.
 * Returns a new sorted array (does not mutate).
 */
export function sortData<T>(
  data: T[],
  field: string | null,
  dir: SortDir,
): T[] {
  if (!field || !dir) return data
  return [...data].sort((a, b) => {
    const av = (a as Record<string, unknown>)[field]
    const bv = (b as Record<string, unknown>)[field]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av
    }
    const r = String(av).localeCompare(String(bv))
    return dir === 'asc' ? r : -r
  })
}
