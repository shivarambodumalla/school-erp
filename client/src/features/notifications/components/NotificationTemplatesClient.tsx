'use client'

import { useState, useEffect } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Template {
  id: string
  type: string
  titleTemplate: string
  bodyTemplate: string
  variables: string[]
}

const TYPE_GROUPS: Record<string, string[]> = {
  Finance: ['FEE_DUE', 'FEE_PAID', 'FEE_OVERDUE'],
  Attendance: ['ATTENDANCE_ABSENT', 'ATTENDANCE_SUMMARY'],
  Academic: ['GRADE_PUBLISHED', 'ASSIGNMENT_DUE', 'QUIZ_AVAILABLE', 'HOMEWORK_ASSIGNED'],
  School: ['ANNOUNCEMENT', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'SUBSTITUTION', 'GENERAL', 'SYSTEM'],
}

export function NotificationTemplatesClient() {
  const { apiParam } = useInstitutionId()
  const [templates, setTemplates] = useState<Template[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/school/notifications/templates${apiParam}`)
      .then(r => r.json())
      .then(data => {
        setTemplates(data.templates ?? data ?? [])
        setLoading(false)
      })
  }, [apiParam])

  function startEdit(t: Template) {
    setEditing(t.id)
    setEditTitle(t.titleTemplate)
    setEditBody(t.bodyTemplate)
  }

  async function handleSave(t: Template) {
    setSaving(true)
    try {
      await fetch(`/api/school/notifications/templates${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, type: t.type, titleTemplate: editTitle, bodyTemplate: editBody }),
      })
      setTemplates(prev =>
        prev.map(tp => tp.id === t.id ? { ...tp, titleTemplate: editTitle, bodyTemplate: editBody } : tp)
      )
      setEditing(null)
      toast.success('Template saved')
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )

  const grouped = Object.entries(TYPE_GROUPS).map(([group, types]) => ({
    group,
    items: templates.filter(t => types.includes(t.type)),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize notification messages</p>
      </div>

      {grouped.map(({ group, items }) => (
        <div key={group} className="space-y-3">
          <h2 className="font-semibold text-lg">{group}</h2>
          {items.map(t => (
            <Card key={t.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{t.type.replace(/_/g, ' ')}</Badge>
                {editing !== t.id && (
                  <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => startEdit(t)}>
                    Edit
                  </Button>
                )}
              </div>
              {editing === t.id ? (
                <div className="space-y-3">
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    placeholder="Title template" className="min-h-[44px]" />
                  <textarea value={editBody} onChange={e => setEditBody(e.target.value)}
                    rows={3} placeholder="Body template"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                  <div className="flex flex-wrap gap-1">
                    {t.variables.map(v => (
                      <Badge key={v} variant="outline" className="text-xs cursor-pointer"
                        onClick={() => setEditBody(prev => prev + `{{${v}}}`)}>
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" className="min-h-[44px]" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                    <Button className="min-h-[44px]" disabled={saving} onClick={() => handleSave(t)}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{t.titleTemplate}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.bodyTemplate}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ))}

      {templates.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No templates configured</p>
      )}
    </div>
  )
}
