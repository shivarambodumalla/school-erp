'use client'

import { memo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AccessLevel, Permission } from '../types'

const ACCESS_LEVELS: AccessLevel[] = ['NONE', 'VIEW', 'EDIT', 'FULL']

interface PermissionRowProps {
  featureKey: string
  label: string
  permission: Permission
  readOnly: boolean
  onChange: (feature: string, field: 'access' | 'scope', value: string) => void
}

export const PermissionRow = memo(function PermissionRow({
  featureKey,
  label,
  permission,
  readOnly,
  onChange,
}: PermissionRowProps) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2.5 px-3 text-sm">{label}</td>
      {ACCESS_LEVELS.map((level) => (
        <td key={level} className="py-2.5 text-center">
          <label className="inline-flex items-center justify-center">
            <input
              type="radio"
              name={`perm-${featureKey}`}
              value={level}
              checked={permission.access === level}
              disabled={readOnly}
              onChange={() => onChange(featureKey, 'access', level)}
              className="h-4 w-4 accent-primary cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="sr-only">{level}</span>
          </label>
        </td>
      ))}
      <td className="py-2.5 px-3">
        <Select
          value={permission.scope}
          onValueChange={(v) => onChange(featureKey, 'scope', v)}
          disabled={readOnly || permission.access === 'NONE'}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All records</SelectItem>
            <SelectItem value="OWN">Only their own</SelectItem>
            <SelectItem value="SECTION">Their section only</SelectItem>
          </SelectContent>
        </Select>
      </td>
    </tr>
  )
})
