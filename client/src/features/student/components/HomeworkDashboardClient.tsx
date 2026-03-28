'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface HomeworkItem {
  id: string
  title: string
  description: string | null
  dueDate: string
  subjectName: string
  isDone: boolean
}

function getGroup(dueDate: string): string {
  const d = new Date(dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)

  if (d < today) return 'Overdue'
  if (d < tomorrow) return 'Today'
  if (d < new Date(tomorrow.getTime() + 86400000)) return 'Tomorrow'
  if (d < weekEnd) return 'This Week'
  return 'Later'
}

export function HomeworkDashboardClient() {
  const [items, setItems] = useState<HomeworkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/homework')
      .then((r) => r.json())
      .then((d: { homework: HomeworkItem[] }) => setItems(d.homework))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (id: string, current: boolean) => {
    setItems((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isDone: !current } : h)),
    )
    await fetch('/api/student/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeworkId: id, isDone: !current }),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const grouped: Record<string, HomeworkItem[]> = {}
  for (const h of items) {
    const g = getGroup(h.dueDate)
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(h)
  }

  const order = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Homework</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your assignments and tasks
        </p>
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No homework assigned yet.
        </p>
      )}

      {order.map((group) => {
        const list = grouped[group]
        if (!list?.length) return null
        return (
          <div key={group} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground
              uppercase tracking-wider">
              {group}
            </h3>
            {list.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-lg border
                  bg-card px-4 py-3"
              >
                <Checkbox
                  checked={h.isDone}
                  onCheckedChange={() => toggle(h.id, h.isDone)}
                  className="h-5 w-5"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    h.isDone ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {h.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.subjectName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
