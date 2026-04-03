'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import type { Permission, StaffRoleListItem } from '../types'
import { RoleCard } from './RoleCard'
import { RolesEmptyState } from './RolesEmptyState'
import { PermissionMatrixSheet } from './PermissionMatrixSheet'
import { CreateRoleSheet } from './CreateRoleSheet'
import { RoleViewDrawer } from './RoleViewDrawer'

export function StaffRolesClient() {
  const confirm = useConfirm()
  const [roles, setRoles] = useState<StaffRoleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [cloneFrom, setCloneFrom] = useState<StaffRoleListItem | null>(null)
  const [matrixRole, setMatrixRole] = useState<StaffRoleListItem | null>(null)
  const [matrixReadOnly, setMatrixReadOnly] = useState(false)
  const [matrixOpen, setMatrixOpen] = useState(false)

  // View drawer state
  const [viewRole, setViewRole] = useState<StaffRoleListItem | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/school/staff-roles')
      if (res.ok) setRoles((await res.json()) as StaffRoleListItem[])
    } catch {
      toast.error('Failed to load roles')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const handleCardClick = (role: StaffRoleListItem) => {
    setViewRole(role)
    setViewOpen(true)
  }

  const handleEdit = (role: StaffRoleListItem) => {
    setViewOpen(false)
    setMatrixRole(role)
    setMatrixReadOnly(false)
    setMatrixOpen(true)
  }

  const handleDelete = async (role: StaffRoleListItem) => {
    const ok = await confirm({
      title: 'Delete Role',
      description: `Delete role "${role.name}"?`,
      note: 'This action cannot be undone.',
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/school/staff-roles/${role.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Role "${role.name}" deleted`)
        setViewOpen(false)
        fetchRoles()
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch {
      toast.error('Failed to delete role')
    }
  }

  const handleSavePermissions = async (
    roleId: string,
    permissions: Permission[]
  ) => {
    const res = await fetch(`/api/school/staff-roles/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    })
    if (!res.ok) {
      const err = (await res.json()) as { error: string }
      throw new Error(err.error)
    }
    fetchRoles()
  }

  const handleClone = (role: StaffRoleListItem) => {
    setViewOpen(false)
    setMatrixOpen(false)
    setCloneFrom(role)
    setCreateOpen(true)
  }

  const handleCreateOpen = () => {
    setCloneFrom(null)
    setCreateOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Staff Roles</h1>
            {roles.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
                {roles.length}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage roles and granular permissions for your staff
          </p>
        </div>
        <Button onClick={handleCreateOpen} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Role
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <RolesEmptyState onCreate={handleCreateOpen} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onClick={handleCardClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* View-only drawer */}
      <RoleViewDrawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        role={viewRole}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClone={handleClone}
      />

      {/* Edit permissions sheet */}
      <PermissionMatrixSheet
        open={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        role={matrixRole}
        readOnly={matrixReadOnly}
        onSave={handleSavePermissions}
      />

      {/* Create role sheet */}
      <CreateRoleSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        existingRoles={roles}
        onCreated={fetchRoles}
        cloneFrom={cloneFrom}
      />
    </div>
  )
}
