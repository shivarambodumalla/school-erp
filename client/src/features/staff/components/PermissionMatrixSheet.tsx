'use client'

import { useState } from 'react'
import { AlertTriangle, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import type { Permission, StaffRoleListItem } from '../types'
import { PermissionMatrixTable } from './PermissionMatrixTable'

interface PermissionMatrixSheetProps {
  open: boolean
  onClose: () => void
  role: StaffRoleListItem | null
  readOnly: boolean
  onSave: (roleId: string, permissions: Permission[]) => Promise<void>
  onClone?: (role: StaffRoleListItem) => void
}

export function PermissionMatrixSheet({
  open,
  onClose,
  role,
  readOnly,
  onSave,
  onClone,
}: PermissionMatrixSheetProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [saving, setSaving] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && role) {
      setPermissions(role.permissions as Permission[])
    }
    if (!isOpen) onClose()
  }

  const handleSave = async () => {
    if (!role) return
    setSaving(true)
    try {
      await onSave(role.id, permissions)
      toast.success('Permissions updated')
      onClose()
    } catch {
      toast.error('Failed to save permissions')
    }
    setSaving(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            Permissions{role ? ` \u2014 ${role.name}` : ''}
          </SheetTitle>
          <SheetDescription>
            {readOnly
              ? 'View the permission matrix for this role.'
              : 'Configure feature access levels and scopes.'}
          </SheetDescription>
        </SheetHeader>

        {role?.isSystemRole && (
          <div
            className="mt-4 flex items-start gap-3 rounded-lg border
              border-amber-200 bg-amber-50 p-3 text-sm text-amber-800
              dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">System role</p>
              <p className="text-xs mt-0.5">
                System roles cannot be edited. Clone this role to create an
                editable copy.
              </p>
            </div>
            {onClone && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 min-h-[44px]"
                onClick={() => onClone(role)}
              >
                <Copy className="h-4 w-4" /> Clone Role
              </Button>
            )}
          </div>
        )}

        <div className="mt-6">
          <PermissionMatrixTable
            permissions={permissions}
            readOnly={readOnly}
            onChange={setPermissions}
          />
        </div>

        {!readOnly && (
          <SheetFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-h-[44px]"
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
