'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  StickyNote,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { VideoViewer } from './VideoViewer'
import { FileViewer } from './FileViewer'
import { TextViewer } from './TextViewer'
import { LinkViewer } from './LinkViewer'
import { AssignmentViewer } from './AssignmentViewer'
import { QuizViewer } from './QuizViewer'
import { DiscussionViewer } from './DiscussionViewer'
import { LiveClassViewer } from './LiveClassViewer'
import { AnnouncementViewer } from './AnnouncementViewer'
import { NotebookPanel } from './NotebookPanel'
import type { SubjectModuleItem } from '../../lms-types'
import { ITEM_TYPE_CONFIG } from '../../lms-types'

interface Props {
  subjectId: string
  itemId: string
  portalType: string
}

interface ItemDetailResponse {
  item: SubjectModuleItem
  nextItemId: string | null
  prevItemId: string | null
  moduleName: string
}

export function ItemDetailClient({
  subjectId,
  itemId,
  portalType,
}: Props) {
  const router = useRouter()
  const [data, setData] =
    useState<ItemDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notebookOpen, setNotebookOpen] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)

  const fetchItem = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/items/${itemId}`
      )
      if (!res.ok) {
        router.push(`/management/subjects/${subjectId}`)
        return
      }
      const json =
        (await res.json()) as ItemDetailResponse
      setData(json)
    } catch {
      router.push(`/management/subjects/${subjectId}`)
    } finally {
      setLoading(false)
    }
  }, [subjectId, itemId, router])

  useEffect(() => {
    fetchItem()
  }, [fetchItem])

  const handleMarkComplete = async () => {
    setMarkingComplete(true)
    try {
      await fetch(
        `/api/school/subjects/${subjectId}/items/${itemId}/progress`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: true }),
        }
      )
      toast.success('Marked as complete')
    } catch {
      toast.error('Failed to mark complete')
    } finally {
      setMarkingComplete(false)
    }
  }

  const handleNext = () => {
    if (data?.nextItemId) {
      router.push(
        `/management/subjects/${subjectId}/items/${data.nextItemId}`
      )
    }
  }

  if (loading) {
    return <ItemDetailSkeleton />
  }

  if (!data) return null

  const { item, nextItemId, moduleName } = data
  const config = ITEM_TYPE_CONFIG[item.type]
  const isStudent =
    portalType === 'STUDENT' || portalType === 'PARENT'

  return (
    <div className="space-y-4">
      {/* Top bar: Back + breadcrumb + actions */}
      <div
        className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                `/management/subjects/${subjectId}`
              )
            }
            className="shrink-0 h-9 gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <span className="text-sm text-muted-foreground truncate hidden sm:inline">
            {moduleName}
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 hidden sm:block" />
          <Badge className={`shrink-0 ${config.bgColor}`}>
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotebookOpen(true)}
            className="min-h-[44px] gap-1.5"
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </Button>
          {isStudent && (
            <Button
              size="sm"
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="min-h-[44px] gap-1.5"
            >
              {markingComplete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark Complete
            </Button>
          )}
          {nextItemId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="min-h-[44px] gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Item title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {item.title}
        </h1>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
        )}
      </div>

      {/* Viewer based on type */}
      <ItemViewer
        item={item}
        subjectId={subjectId}
        portalType={portalType}
      />

      {/* Notebook slide-over */}
      <NotebookPanel
        open={notebookOpen}
        onOpenChange={setNotebookOpen}
        subjectId={subjectId}
        itemId={itemId}
      />
    </div>
  )
}

function ItemViewer({
  item,
  subjectId,
  portalType,
}: {
  item: SubjectModuleItem
  subjectId: string
  portalType: string
}) {
  switch (item.type) {
    case 'VIDEO':
      return <VideoViewer item={item} />
    case 'FILE':
      return <FileViewer item={item} />
    case 'TEXT':
      return <TextViewer item={item} />
    case 'LINK':
      return <LinkViewer item={item} />
    case 'ASSIGNMENT':
      return (
        <AssignmentViewer
          item={item}
          subjectId={subjectId}
          portalType={portalType}
        />
      )
    case 'QUIZ':
      return (
        <QuizViewer
          item={item}
          subjectId={subjectId}
        />
      )
    case 'DISCUSSION':
      return (
        <DiscussionViewer
          item={item}
          subjectId={subjectId}
        />
      )
    case 'LIVE_CLASS':
      return <LiveClassViewer item={item} />
    case 'ANNOUNCEMENT':
      return (
        <AnnouncementViewer
          item={item}
          subjectId={subjectId}
        />
      )
    default:
      return (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Unsupported item type
          </p>
        </div>
      )
  }
}

function ItemDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}
