'use client'

import { Shield, Users, Pencil, Trash2, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  type StaffRoleListItem,
  type Permission,
  FEATURE_GROUPS,
  summarizePermissions,
} from '../types'

interface RoleViewDrawerProps {
  open: boolean
  onClose: () => void
  role: StaffRoleListItem | null
  onEdit: (role: StaffRoleListItem) => void
  onDelete: (role: StaffRoleListItem) => void
  onClone: (role: StaffRoleListItem) => void
}

const ACCESS_COLORS: Record<string, string> = {
  FULL: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  EDIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  VIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  NONE: 'bg-muted text-muted-foreground',
}

function safePerms(role: StaffRoleListItem | null): Permission[] {
  if (!role) return []
  if (Array.isArray(role.permissions)) return role.permissions as Permission[]
  return []
}

export function RoleViewDrawer({
  open,
  onClose,
  role,
  onEdit,
  onDelete,
  onClone,
}: RoleViewDrawerProps) {
  const perms = safePerms(role)
  const summary = summarizePermissions(perms)
  const staffCount = role ? role._count.primaryStaff + role._count.assignments : 0
  const permMap = new Map(perms.map((p) => [p.feature, p]))
  const grantedCount = summary.full + summary.edit + summary.view

  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {role && (
          <div className="flex flex-col min-h-full">
            <SheetHeader className="p-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate">{role.name}</SheetTitle>
                  <SheetDescription className="mt-0.5">
                    {role.isSystemRole ? 'System role' : 'Custom role'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="p-6 space-y-6 flex-1">
              {/* Meta info */}
              <div className="flex flex-wrap gap-2">
                {role.isSystemRole && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">System</Badge>
                )}
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {staffCount} staff assigned
                </Badge>
              </div>

              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}

              {/* Permission summary stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{summary.full}</p>
                  <p className="text-xs text-muted-foreground">Full</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">{summary.edit}</p>
                  <p className="text-xs text-muted-foreground">Edit</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-amber-600">{summary.view}</p>
                  <p className="text-xs text-muted-foreground">View</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-muted-foreground">{summary.none}</p>
                  <p className="text-xs text-muted-foreground">None</p>
                </div>
              </div>

              {/* Permission details — only granted */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  Permissions ({grantedCount} granted)
                </h3>
                {grantedCount === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No permissions assigned
                  </p>
                ) : (
                  Object.entries(FEATURE_GROUPS).map(([key, group]) => {
                    const granted = group.features
                      .map((f) => ({ ...f, perm: permMap.get(f.key) }))
                      .filter((item) => item.perm && item.perm.access !== 'NONE')

                    if (granted.length === 0) return null

                    return (
                      <div key={key} className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </p>
                        <div className="space-y-1">
                          {granted.map((item) => {
                            const access = item.perm!.access
                            const scope = item.perm!.scope
                            return (
                              <div
                                key={item.key}
                                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 text-sm"
                              >
                                <span>{item.label}</span>
                                <div className="flex items-center gap-1.5">
                                  {scope !== 'ALL' && (
                                    <span className="text-xs text-muted-foreground">{scope}</span>
                                  )}
                                  <Badge variant="secondary" className={`text-xs ${ACCESS_COLORS[access] ?? ''}`}>
                                    {access}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Sticky footer actions */}
            <div className="sticky bottom-0 border-t bg-background p-4 flex items-center gap-2">
              {role.isSystemRole && (
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => { onClose(); onClone(role) }}
                >
                  <Copy className="h-4 w-4" /> Clone
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => { onClose(); onEdit(role) }}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              {!role.isSystemRole && (
                <Button
                  variant="outline"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => { onClose(); onDelete(role) }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
