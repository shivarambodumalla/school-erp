'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  type Permission,
  type StaffRoleListItem,
  getDefaultPermissions,
} from '../types'
import { PermissionMatrixTable } from './PermissionMatrixTable'
import { CreateRoleStep1 } from './CreateRoleStep1'

interface CreateRoleSheetProps {
  open: boolean
  onClose: () => void
  existingRoles: StaffRoleListItem[]
  onCreated: () => void
  cloneFrom?: StaffRoleListItem | null
}

export function CreateRoleSheet({
  open,
  onClose,
  existingRoles,
  onCreated,
  cloneFrom,
}: CreateRoleSheetProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [templateId, setTemplateId] = useState<string>('none')
  const [permissions, setPermissions] = useState<Permission[]>(
    getDefaultPermissions()
  )
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setStep(1)
    setName(cloneFrom ? `${cloneFrom.name} (Copy)` : '')
    setDescription(cloneFrom?.description ?? '')
    setTemplateId('none')
    setPermissions(
      cloneFrom
        ? (cloneFrom.permissions as Permission[])
        : getDefaultPermissions()
    )
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) reset()
    if (!isOpen) onClose()
  }

  const goToStep2 = () => {
    if (!name.trim()) {
      toast.error('Role name is required')
      return
    }
    if (templateId !== 'none') {
      const tpl = existingRoles.find((r) => r.id === templateId)
      if (tpl) setPermissions(tpl.permissions as Permission[])
    }
    setStep(2)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/school/staff-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          permissions,
        }),
      })

      if (res.status === 409) {
        toast.error('A role with this name already exists')
        setSaving(false)
        return
      }

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        toast.error(err.error || 'Failed to create role')
        setSaving(false)
        return
      }

      toast.success(`Role "${name.trim()}" created`)
      onCreated()
      onClose()
    } catch {
      toast.error('Something went wrong')
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
            {step === 1 ? 'Create Role' : 'Set Permissions'}
          </SheetTitle>
          <SheetDescription>
            {step === 1
              ? 'Step 1 of 2: Name your role and pick a template.'
              : 'Step 2 of 2: Configure the permission matrix.'}
          </SheetDescription>
        </SheetHeader>

        {step === 1 ? (
          <CreateRoleStep1
            name={name}
            description={description}
            templateId={templateId}
            existingRoles={existingRoles}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTemplateChange={setTemplateId}
            onNext={goToStep2}
          />
        ) : (
          <div className="mt-6 space-y-5">
            <PermissionMatrixTable
              permissions={permissions}
              readOnly={false}
              onChange={setPermissions}
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="min-h-[44px] gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 min-h-[44px]"
              >
                {saving ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
