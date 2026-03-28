'use client'

import { Shield, Users, Eye, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  type StaffRoleListItem,
  type Permission,
  summarizePermissions,
} from '../types'

interface RoleCardProps {
  role: StaffRoleListItem
  onView: (role: StaffRoleListItem) => void
  onEdit: (role: StaffRoleListItem) => void
  onDelete: (role: StaffRoleListItem) => void
}

export function RoleCard({ role, onView, onEdit, onDelete }: RoleCardProps) {
  const perms = role.permissions as Permission[]
  const summary = summarizePermissions(perms)
  const staffCount = role._count.primaryStaff + role._count.assignments

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Shield className="h-5 w-5 shrink-0 text-primary" />
          <h3 className="font-semibold truncate">{role.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {role.isSystemRole && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              System
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {staffCount}
          </Badge>
        </div>
      </div>

      {role.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {role.description}
        </p>
      )}

      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
        {summary.full > 0 && <span>{summary.full} Full</span>}
        {summary.edit > 0 && <span>{summary.edit} Edit</span>}
        {summary.view > 0 && <span>{summary.view} View</span>}
        {summary.none > 0 && <span>{summary.none} None</span>}
        {perms.length === 0 && <span>No permissions set</span>}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] gap-1.5"
          onClick={() => onView(role)}
        >
          <Eye className="h-4 w-4" /> View
        </Button>
        {!role.isSystemRole && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] gap-1.5"
              onClick={() => onEdit(role)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] gap-1.5 text-destructive
                hover:text-destructive"
              onClick={() => onDelete(role)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
