'use client'

import { useState } from 'react'
import { Shield, Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  type StaffRoleListItem,
  type Permission,
  summarizePermissions,
} from '../types'

interface RoleCardProps {
  role: StaffRoleListItem
  onClick: (role: StaffRoleListItem) => void
  onEdit: (role: StaffRoleListItem) => void
  onDelete: (role: StaffRoleListItem) => void
}

export function RoleCard({ role, onClick, onEdit, onDelete }: RoleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const perms = role.permissions as Permission[]
  const summary = summarizePermissions(perms)
  const staffCount = role._count.primaryStaff + role._count.assignments

  return (
    <div
      className="rounded-xl border bg-card p-5 flex flex-col gap-3
        cursor-pointer hover:shadow-md transition-all group"
      onClick={() => onClick(role)}
    >
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
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="h-8 w-8 flex items-center justify-center rounded-md
                text-muted-foreground hover:text-foreground hover:bg-muted
                transition-colors opacity-0 group-hover:opacity-100
                focus:opacity-100"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-40
                  rounded-lg border bg-popover shadow-md py-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm
                      hover:bg-muted transition-colors min-h-[44px]"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onEdit(role)
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  {!role.isSystemRole && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm
                        text-destructive hover:bg-muted transition-colors min-h-[44px]"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onDelete(role)
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
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
    </div>
  )
}
