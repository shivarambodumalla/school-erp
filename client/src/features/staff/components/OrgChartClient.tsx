'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { OrgNode } from '../types'

interface FlatStaff {
  id: string
  firstName: string
  lastName: string
  designation: string
  departmentId: string | null
  department: { name: string } | null
  reportsToId: string | null
}

interface DeptOption { id: string; name: string }

export function OrgChartClient() {
  const router = useRouter()
  const [flat, setFlat] = useState<FlatStaff[]>([])
  const [departments, setDepartments] = useState<DeptOption[]>([])
  const [deptFilter, setDeptFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const res = await fetch('/api/school/staff?page=1')
      if (res.ok) {
        const data = (await res.json()) as { staff: FlatStaff[]; total: number }
        // Fetch all pages
        const pages = Math.ceil(data.total / 20)
        let all = [...data.staff]
        for (let p = 2; p <= pages; p++) {
          const r = await fetch(`/api/school/staff?page=${p}`)
          if (r.ok) {
            const d = (await r.json()) as { staff: FlatStaff[] }
            all = all.concat(d.staff)
          }
        }
        setFlat(all)

        // Extract unique departments
        const deptMap = new Map<string, string>()
        for (const s of all) {
          if (s.departmentId && s.department) {
            deptMap.set(s.departmentId, s.department.name)
          }
        }
        setDepartments(
          Array.from(deptMap, ([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        )
      }
      setLoading(false)
    })()
  }, [])

  const buildTree = useCallback((): OrgNode[] => {
    const filtered = deptFilter
      ? flat.filter(s => s.departmentId === deptFilter)
      : flat

    const map = new Map<string, OrgNode>()
    for (const s of filtered) {
      map.set(s.id, { ...s, directReports: [] })
    }

    const roots: OrgNode[] = []
    for (const node of Array.from(map.values())) {
      if (node.reportsToId && map.has(node.reportsToId)) {
        map.get(node.reportsToId)!.directReports.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }, [flat, deptFilter])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  const tree = buildTree()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon"
          onClick={() => router.push('/management/staff')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Org Chart</h1>
      </div>

      {/* Department filter pills */}
      <div className="flex flex-wrap gap-2">
        <Button variant={deptFilter === null ? 'default' : 'outline'}
          size="sm" className="min-h-[44px]"
          onClick={() => setDeptFilter(null)}>
          All
        </Button>
        {departments.map(d => (
          <Button key={d.id}
            variant={deptFilter === d.id ? 'default' : 'outline'}
            size="sm" className="min-h-[44px]"
            onClick={() => setDeptFilter(d.id)}>
            {d.name}
          </Button>
        ))}
      </div>

      {tree.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          No staff to display
        </div>
      ) : (
        <div className="rounded-xl border p-6 overflow-x-auto">
          {tree.map(node => (
            <TreeNode key={node.id} node={node} level={0} />
          ))}
        </div>
      )}
    </div>
  )
}

function TreeNode({ node, level }: { node: OrgNode; level: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(level < 2)
  const hasChildren = node.directReports.length > 0

  return (
    <div style={{ marginLeft: level * 24 }}>
      <div className="flex items-center gap-2 py-2 group">
        {hasChildren ? (
          <button type="button" onClick={() => setOpen(!open)}
            className="h-6 w-6 flex items-center justify-center shrink-0">
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => router.push(`/management/staff/${node.id}`)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 hover:bg-muted/60 transition-colors text-left"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center
            text-xs font-bold text-primary shrink-0">
            {node.firstName[0]}{node.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-medium group-hover:text-primary transition-colors">
              {node.firstName} {node.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {node.designation}
              {node.department ? ` \u00b7 ${node.department.name}` : ''}
            </p>
          </div>
        </button>
      </div>
      {open && node.directReports.map(child => (
        <TreeNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  )
}
