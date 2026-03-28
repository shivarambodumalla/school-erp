'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Permission, StaffRoleListItem } from '../types'
import { RoleCard } from './RoleCard'
import { RolesEmptyState } from './RolesEmptyState'
import { PermissionMatrixSheet } from './PermissionMatrixSheet'
import { CreateRoleSheet } from './CreateRoleSheet'

export function StaffRolesClient() {
  const [roles, setRoles] = useState<StaffRoleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [cloneFrom, setCloneFrom] = useState<StaffRoleListItem | null>(null)
  const [matrixRole, setMatrixRole] = useState<StaffRoleListItem | null>(null)
  const [matrixReadOnly, setMatrixReadOnly] = useState(true)
  const [matrixOpen, setMatrixOpen] = useState(false)

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

  const handleView = (role: StaffRoleListItem) => {
    setMatrixRole(role)
    setMatrixReadOnly(true)
    setMatrixOpen(true)
  }

  const handleEdit = (role: StaffRoleListItem) => {
    setMatrixRole(role)
    setMatrixReadOnly(false)
    setMatrixOpen(true)
  }

  const handleDelete = async (role: StaffRoleListItem) => {
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`))
      return
    try {
      const res = await fetch(`/api/school/staff-roles/${role.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Role "${role.name}" deleted`)
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
          <h1 className="text-2xl font-bold tracking-tight">Staff Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage roles and granular permissions for your staff
          </p>
        </div>
        <Button onClick={handleCreateOpen} className="min-h-[44px] gap-1.5">
          <Plus className="h-4 w-4" /> Create Role
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
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
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PermissionMatrixSheet
        open={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        role={matrixRole}
        readOnly={matrixReadOnly}
        onSave={handleSavePermissions}
        onClone={handleClone}
      />

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
