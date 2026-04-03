'use client'

import { useCallback, useEffect, useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { PostAnnouncementSheet } from './announcements/PostAnnouncementSheet'

interface Announcement {
  id: string; title: string; content: string; createdAt: string
  createdBy: { email: string }
}

interface Props {
  deptId: string
  isAdmin: boolean
}

export function DeptAnnouncementsTab({ deptId, isAdmin }: Props) {
  const confirm = useConfirm()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/departments/${deptId}/announcements`)
      if (res.ok) setAnnouncements(await res.json() as Announcement[])
    } catch { toast.error('Failed to load announcements') }
    setLoading(false)
  }, [deptId])

  useEffect(() => { fetch_() }, [fetch_])

  const handleDelete = async (annoId: string) => {
    const ok = await confirm({
      title: 'Delete Announcement',
      description: 'Are you sure you want to delete this announcement?',
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/school/departments/${deptId}/announcements/${annoId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Announcement deleted'); fetch_() }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to delete') }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Megaphone className="h-4 w-4" /> Announcements
        </h3>
        {isAdmin && (
          <Button variant="outline" onClick={() => setSheetOpen(true)} className="gap-1.5 min-h-[44px]">
            <Plus className="h-4 w-4" /> Post Announcement
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="h-10 w-10 mx-auto mb-2" />
          <p className="font-medium">No announcements yet</p>
          <p className="text-sm">Post the first announcement for this department</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm">{a.title}</h4>
                {isAdmin && (
                  <button type="button" onClick={() => handleDelete(a.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px] shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{a.createdBy.email}</span>
                <span>-</span>
                <span>{timeAgo(a.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <PostAnnouncementSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
        deptId={deptId} onPosted={fetch_} />
    </div>
  )
}
