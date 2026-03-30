'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
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
}

export function PermissionMatrixSheet({
  open,
  onClose,
  role,
  readOnly,
  onSave,
}: PermissionMatrixSheetProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [saving, setSaving] = useState(false)

  // Sync permissions when role changes or sheet opens
  useEffect(() => {
    if (open && role) {
      const perms = role.permissions
      setPermissions(Array.isArray(perms) ? perms : [])
    }
  }, [open, role])

  const handleOpenChange = (isOpen: boolean) => {
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
              border-blue-200 bg-blue-50 p-3 text-sm text-blue-800
              dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Built-in role</p>
              <p className="text-xs mt-0.5">
                Permissions are customizable, but the role name cannot be changed.
              </p>
            </div>
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
