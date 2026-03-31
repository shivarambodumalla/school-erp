'use client'

import { getDeptInitials } from '../../types'

const PRESETS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
]

interface Props {
  color: string
  onChange: (c: string) => void
  name: string
}

export function ColorPicker({ color, onChange, name }: Props) {
  const initials = name ? getDeptInitials(name) : '??'

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Color</label>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: color }}>
          {initials}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((c) => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className={`h-8 w-8 rounded-full border-2 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center
                ${color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
