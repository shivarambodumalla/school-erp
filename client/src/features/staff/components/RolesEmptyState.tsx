'use client'

import { Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RolesEmptyStateProps {
  onCreate: () => void
}

export function RolesEmptyState({ onCreate }: RolesEmptyStateProps) {
  return (
    <div
      className="rounded-xl border bg-card p-16 flex flex-col
        items-center justify-center gap-4 text-center"
    >
      <div
        className="h-14 w-14 rounded-full bg-muted flex items-center
          justify-center"
      >
        <Shield className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold">No roles yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Create your first role to start assigning permissions to staff.
        </p>
      </div>
      <Button onClick={onCreate} className="min-h-[44px] gap-1.5">
        <Plus className="h-4 w-4" /> Create Role
      </Button>
    </div>
  )
}
