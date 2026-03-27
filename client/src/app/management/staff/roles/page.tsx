import { Construction } from 'lucide-react'

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Roles & Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create custom roles for your staff
        </p>
      </div>
      <div className="rounded-xl border bg-card p-16 flex flex-col
        items-center justify-center gap-4 text-center">
        <div className="h-14 w-14 rounded-full bg-muted flex
          items-center justify-center">
          <Construction className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">
            Roles & Permissions — Coming Week 6 (May 6)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Define custom roles with granular permissions. Assign roles to staff members to control access.
          </p>
        </div>
      </div>
    </div>
  )
}