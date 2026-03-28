'use client'

import type { Permission } from '../types'
import { PermissionRow } from './PermissionRow'

interface PermissionGroupRowsProps {
  groupLabel: string
  features: { key: string; label: string }[]
  permMap: Map<string, Permission>
  readOnly: boolean
  onFieldChange: (
    feature: string,
    field: 'access' | 'scope',
    value: string
  ) => void
}

export function PermissionGroupRows({
  groupLabel,
  features,
  permMap,
  readOnly,
  onFieldChange,
}: PermissionGroupRowsProps) {
  return (
    <>
      <tr>
        <td
          colSpan={6}
          className="bg-muted/40 px-3 py-2 text-xs font-semibold
            uppercase tracking-wide text-muted-foreground"
        >
          {groupLabel}
        </td>
      </tr>
      {features.map((f) => {
        const perm = permMap.get(f.key) ?? {
          feature: f.key,
          access: 'NONE' as const,
          scope: 'ALL' as const,
        }
        return (
          <PermissionRow
            key={f.key}
            featureKey={f.key}
            label={f.label}
            permission={perm}
            readOnly={readOnly}
            onChange={onFieldChange}
          />
        )
      })}
    </>
  )
}
