export interface DepartmentHod {
  id: string
  firstName: string
  lastName: string
  designation: string
  user: { email: string } | null
}

export interface DepartmentDeputyHod {
  id: string
  firstName: string
  lastName: string
  designation: string
}

export interface Department {
  id: string
  name: string
  description: string | null
  color: string
  avatarUrl: string | null
  status: 'ACTIVE' | 'INACTIVE'
  hodId: string | null
  deputyHodId: string | null
  hodSince: string | null
  subjectNames: string[]
  createdAt: string
  hod: DepartmentHod | null
  deputyHod: DepartmentDeputyHod | null
  _count: { staff: number; announcements: number }
}

export type DepartmentStatus = 'ALL' | 'ACTIVE' | 'INACTIVE'
export type ViewMode = 'grid' | 'list'

export function getDeptInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function formatHodSince(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
