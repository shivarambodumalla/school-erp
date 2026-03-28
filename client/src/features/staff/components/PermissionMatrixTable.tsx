'use client'

import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import {
  type Permission,
  type AccessLevel,
  FEATURE_GROUPS,
  getDefaultPermissions,
} from '../types'
import { PermissionGroupRows } from './PermissionGroupRows'

interface PermissionMatrixTableProps {
  permissions: Permission[]
  readOnly: boolean
  onChange: (permissions: Permission[]) => void
}

export function PermissionMatrixTable({
  permissions,
  readOnly,
  onChange,
}: PermissionMatrixTableProps) {
  const permMap = new Map(permissions.map((p) => [p.feature, p]))

  const handleFieldChange = (
    feature: string,
    field: 'access' | 'scope',
    value: string
  ) => {
    const updated: Permission[] = permissions.map((p) => {
      if (p.feature !== feature) return p
      if (field === 'access') {
        return { ...p, access: value as AccessLevel }
      }
      return { ...p, scope: value as Permission['scope'] }
    })
    onChange(updated)
  }

  const setAll = (access: AccessLevel) => {
    onChange(permissions.map((p) => ({ ...p, access })))
  }

  const reset = () => {
    onChange(getDefaultPermissions())
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">
            Quick actions:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setAll('VIEW')}
          >
            Set all VIEW
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setAll('EDIT')}
          >
            Set all EDIT
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={reset}
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
            <tr className="border-b">
              <th className="text-left py-2.5 px-3 font-medium">Feature</th>
              <th className="py-2.5 px-2 font-medium text-center w-16">
                NONE
              </th>
              <th className="py-2.5 px-2 font-medium text-center w-16">
                VIEW
              </th>
              <th className="py-2.5 px-2 font-medium text-center w-16">
                EDIT
              </th>
              <th className="py-2.5 px-2 font-medium text-center w-16">
                FULL
              </th>
              <th className="py-2.5 px-3 font-medium text-left">Scope</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(FEATURE_GROUPS).map(([groupKey, group]) => (
              <PermissionGroupRows
                key={groupKey}
                groupLabel={group.label}
                features={group.features}
                permMap={permMap}
                readOnly={readOnly}
                onFieldChange={handleFieldChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
