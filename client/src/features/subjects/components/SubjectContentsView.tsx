'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  Copy,
  Pencil,
  GripVertical,
  ArrowRightLeft,
  CheckCircle2,
  Circle,
  Video,
  FileText,
  Type,
  Link2,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Radio,
  Megaphone,
  Calendar,
  Clock,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { SubjectAnnouncementBanner } from './SubjectAnnouncementBanner'
import { AddModuleItemSheet } from './AddModuleItemSheet'
import type {
  SubjectModule,
  SubjectModuleItem,
  ModuleItemType,
  ModuleWithProgress,
} from '../lms-types'
import { ITEM_TYPE_CONFIG } from '../lms-types'

// ─── Icon map for item types ───

const ITEM_TYPE_ICONS: Record<ModuleItemType, typeof Video> = {
  VIDEO: Video,
  FILE: FileText,
  TEXT: Type,
  LINK: Link2,
  ASSIGNMENT: ClipboardList,
  QUIZ: HelpCircle,
  DISCUSSION: MessageSquare,
  LIVE_CLASS: Radio,
  ANNOUNCEMENT: Megaphone,
}

// ─── Props ───

interface Props {
  subjectId: string
  portalType?: string
}

export function SubjectContentsView({
  subjectId,
  portalType = 'ADMIN',
}: Props) {
  const isTeacher =
    portalType === 'ADMIN' || portalType === 'TEACHER'

  if (isTeacher) {
    return <TeacherContentsView subjectId={subjectId} />
  }
  return <StudentContentsView subjectId={subjectId} />
}

// ═══════════════════════════════════════════════════════════
// TEACHER VIEW
// ═══════════════════════════════════════════════════════════

function TeacherContentsView({
  subjectId,
}: {
  subjectId: string
}) {
  const [modules, setModules] = useState<SubjectModule[]>([])
  const [loading, setLoading] = useState(true)
  const [addingModule, setAddingModule] = useState(false)
  const [addItemModuleId, setAddItemModuleId] = useState<
    string | null
  >(null)
  const [quickAnnouncement, setQuickAnnouncement] = useState('')
  const [sendingAnnouncement, setSendingAnnouncement] =
    useState(false)

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules`
      )
      if (!res.ok) {
        setModules([])
        return
      }
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.modules ?? [])
      setModules(list as SubjectModule[])
    } catch {
      setModules([])
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const handleAddModule = async () => {
    setAddingModule(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Module',
            order: modules.length,
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to create module')
      toast.success('Module added')
      fetchModules()
    } catch {
      toast.error('Failed to add module')
    } finally {
      setAddingModule(false)
    }
  }

  const handleQuickAnnouncement = async () => {
    if (!quickAnnouncement.trim()) return
    setSendingAnnouncement(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/announcements`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: quickAnnouncement.trim(),
            content: null,
            isUrgent: false,
            isPinned: false,
          }),
        }
      )
      if (!res.ok) throw new Error('Failed')
      toast.success('Announcement posted')
      setQuickAnnouncement('')
    } catch {
      toast.error('Failed to post announcement')
    } finally {
      setSendingAnnouncement(false)
    }
  }

  if (loading) {
    return <ContentsLoadingSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Announcements banner */}
      <SubjectAnnouncementBanner subjectId={subjectId} />

      {/* Header */}
      <div
        className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between"
      >
        <h2 className="text-lg font-semibold">Contents</h2>
        <Button
          onClick={handleAddModule}
          disabled={addingModule}
          size="sm"
          className="min-h-[44px]"
        >
          {addingModule ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" />
          )}
          Add Module
        </Button>
      </div>

      {/* Quick announcement input */}
      <div className="flex gap-2">
        <Input
          value={quickAnnouncement}
          onChange={(e) =>
            setQuickAnnouncement(e.target.value)
          }
          placeholder="Post a quick announcement..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleQuickAnnouncement()
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          disabled={
            sendingAnnouncement ||
            !quickAnnouncement.trim()
          }
          onClick={handleQuickAnnouncement}
          className="shrink-0"
          aria-label="Post announcement"
        >
          {sendingAnnouncement ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Modules list */}
      {modules.length === 0 ? (
        <EmptyModules onAdd={handleAddModule} />
      ) : (
        <div className="space-y-3">
          {modules.map((mod) => (
            <TeacherModuleCard
              key={mod.id}
              module={mod}
              subjectId={subjectId}
              onRefresh={fetchModules}
              onAddItem={() => setAddItemModuleId(mod.id)}
            />
          ))}
        </div>
      )}

      {/* Add Item Sheet */}
      {addItemModuleId && (
        <AddModuleItemSheet
          open={!!addItemModuleId}
          onOpenChange={(open) => {
            if (!open) setAddItemModuleId(null)
          }}
          subjectId={subjectId}
          moduleId={addItemModuleId}
          onCreated={() => {
            setAddItemModuleId(null)
            fetchModules()
          }}
        />
      )}
    </div>
  )
}

// ─── Teacher Module Card ───

function TeacherModuleCard({
  module: mod,
  subjectId,
  onRefresh,
  onAddItem,
}: {
  module: SubjectModule
  subjectId: string
  onRefresh: () => void
  onAddItem: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(mod.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === mod.title) {
      setEditingTitle(false)
      setTitleValue(mod.title)
      return
    }
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${mod.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleValue.trim() }),
        }
      )
      if (!res.ok) throw new Error('Failed')
      toast.success('Module renamed')
      onRefresh()
    } catch {
      toast.error('Failed to rename')
      setTitleValue(mod.title)
    }
    setEditingTitle(false)
  }

  const handleTogglePublish = async () => {
    setToggling(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${mod.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isPublished: !mod.isPublished,
          }),
        }
      )
      if (!res.ok) throw new Error('Failed')
      onRefresh()
    } catch {
      toast.error('Failed to toggle publish')
    } finally {
      setToggling(false)
    }
  }

  const handleToggleLock = async () => {
    setToggling(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${mod.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isLocked: !mod.isLocked }),
        }
      )
      if (!res.ok) throw new Error('Failed')
      onRefresh()
    } catch {
      toast.error('Failed to toggle lock')
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${mod.id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed')
      toast.success('Module deleted')
      onRefresh()
    } catch {
      toast.error('Failed to delete module')
    }
    setMenuOpen(false)
  }

  const handleDuplicate = async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${mod.id}/duplicate`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Failed')
      toast.success('Module duplicated')
      onRefresh()
    } catch {
      toast.error('Failed to duplicate')
    }
    setMenuOpen(false)
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center
            h-8 w-8 shrink-0 rounded-md hover:bg-muted
            transition-colors"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block cursor-grab" />

        {/* Title (inline editable) */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) =>
                setTitleValue(e.target.value)
              }
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave()
                if (e.key === 'Escape') {
                  setTitleValue(mod.title)
                  setEditingTitle(false)
                }
              }}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="text-sm font-semibold text-left
                truncate w-full hover:underline
                decoration-dashed underline-offset-2
                min-h-[32px] flex items-center"
            >
              {mod.title}
            </button>
          )}
        </div>

        {/* Status badges */}
        {!mod.isPublished && (
          <Badge
            variant="secondary"
            className="text-xs shrink-0 hidden sm:inline-flex"
          >
            Draft
          </Badge>
        )}

        {/* Lock toggle */}
        <button
          type="button"
          onClick={handleToggleLock}
          disabled={toggling}
          className="flex items-center justify-center
            h-8 w-8 shrink-0 rounded-md hover:bg-muted
            transition-colors"
          aria-label={mod.isLocked ? 'Unlock' : 'Lock'}
          title={mod.isLocked ? 'Unlock module' : 'Lock module'}
        >
          {mod.isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Unlock className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Publish toggle */}
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={toggling}
          className="flex items-center justify-center
            h-8 w-8 shrink-0 rounded-md hover:bg-muted
            transition-colors"
          aria-label={
            mod.isPublished ? 'Unpublish' : 'Publish'
          }
          title={
            mod.isPublished
              ? 'Unpublish module'
              : 'Publish module'
          }
        >
          {mod.isPublished ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Three-dot menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center
              h-8 w-8 shrink-0 rounded-md hover:bg-muted
              transition-colors"
            aria-label="Module actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <ModuleActionMenu
              onEdit={() => {
                setEditingTitle(true)
                setMenuOpen(false)
              }}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Items list (expanded) */}
      {expanded && (
        <div className="divide-y">
          {mod.items.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No items yet
              </p>
            </div>
          ) : (
            mod.items.map((item) => (
              <TeacherItemRow
                key={item.id}
                item={item}
                subjectId={subjectId}
                moduleId={mod.id}
                onRefresh={onRefresh}
              />
            ))
          )}

          {/* Add Item button */}
          <div className="px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddItem}
              className="min-h-[44px] w-full justify-start
                text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Item
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Teacher Item Row ───

function TeacherItemRow({
  item,
  subjectId,
  moduleId,
  onRefresh,
}: {
  item: SubjectModuleItem
  subjectId: string
  moduleId: string
  onRefresh: () => void
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const Icon = ITEM_TYPE_ICONS[item.type] ?? FileText
  const config = ITEM_TYPE_CONFIG[item.type]

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${moduleId}/items/${item.id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed')
      toast.success('Item deleted')
      onRefresh()
    } catch {
      toast.error('Failed to delete item')
    }
    setMenuOpen(false)
  }

  const handleDuplicate = async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${moduleId}/items/${item.id}/duplicate`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Failed')
      toast.success('Item duplicated')
      onRefresh()
    } catch {
      toast.error('Failed to duplicate')
    }
    setMenuOpen(false)
  }

  const handleClick = () => {
    router.push(
      `/management/subjects/${subjectId}/items/${item.id}`
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group">
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block cursor-grab" />

      {/* Type icon */}
      <div
        className={`h-8 w-8 rounded-md flex items-center
          justify-center shrink-0 ${config.bgColor}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Title + meta */}
      <button
        type="button"
        onClick={handleClick}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-sm font-medium truncate leading-tight">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {config.label}
          </span>
          {item.estimatedMinutes && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {item.estimatedMinutes}m
            </span>
          )}
          {item.dueDate && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {new Date(item.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </button>

      {/* Status badges */}
      {!item.isPublished && (
        <Badge
          variant="secondary"
          className="text-xs shrink-0"
        >
          Draft
        </Badge>
      )}
      {item.scheduledAt &&
        !item.isPublished && (
          <Badge
            variant="outline"
            className="text-xs shrink-0 hidden sm:inline-flex"
          >
            Scheduled
          </Badge>
        )}

      {/* Three-dot menu */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="flex items-center justify-center
            h-8 w-8 shrink-0 rounded-md hover:bg-muted
            transition-colors"
          aria-label="Item actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <ItemActionMenu
            onEdit={handleClick}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

// ─── Action Menus ───

function ModuleActionMenu({
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: {
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-9 z-50 w-44
          bg-popover border rounded-lg shadow-lg py-1"
      >
        <MenuButton
          icon={Pencil}
          label="Edit"
          onClick={onEdit}
        />
        <MenuButton
          icon={Copy}
          label="Duplicate"
          onClick={onDuplicate}
        />
        <MenuButton
          icon={Trash2}
          label="Delete"
          onClick={onDelete}
          destructive
        />
      </div>
    </>
  )
}

function ItemActionMenu({
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: {
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-9 z-50 w-48
          bg-popover border rounded-lg shadow-lg py-1"
      >
        <MenuButton
          icon={Pencil}
          label="Edit"
          onClick={onEdit}
        />
        <MenuButton
          icon={Copy}
          label="Duplicate"
          onClick={onDuplicate}
        />
        <MenuButton
          icon={ArrowRightLeft}
          label="Move to module"
          onClick={() => {
            toast.info('Move to module coming soon')
            onClose()
          }}
        />
        <MenuButton
          icon={Trash2}
          label="Delete"
          onClick={onDelete}
          destructive
        />
      </div>
    </>
  )
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2
        text-sm hover:bg-muted min-h-[44px]
        ${destructive ? 'text-destructive' : ''}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════
// STUDENT VIEW
// ═══════════════════════════════════════════════════════════

function StudentContentsView({
  subjectId,
}: {
  subjectId: string
}) {
  const router = useRouter()
  const [modules, setModules] = useState<
    ModuleWithProgress[]
  >([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [completedItems, setCompletedItems] = useState(0)

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules?student=true`
      )
      if (!res.ok) {
        setModules([])
        return
      }
      const raw = await res.json()
      const data = Array.isArray(raw)
        ? { modules: raw as ModuleWithProgress[], totalItems: 0, completedItems: 0 }
        : (raw as { modules: ModuleWithProgress[]; totalItems: number; completedItems: number })
      setModules(data.modules ?? [])
      setTotalItems(data.totalItems ?? 0)
      setCompletedItems(data.completedItems ?? 0)
    } catch {
      setModules([])
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const handleToggleComplete = async (
    itemId: string,
    completed: boolean
  ) => {
    try {
      await fetch(
        `/api/school/subjects/${subjectId}/items/${itemId}/progress`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: completed }),
        }
      )
      fetchModules()
    } catch {
      toast.error('Failed to update progress')
    }
  }

  if (loading) {
    return <ContentsLoadingSkeleton />
  }

  const progressPercent =
    totalItems > 0
      ? Math.round((completedItems / totalItems) * 100)
      : 0

  return (
    <div className="space-y-4">
      {/* Announcements banner */}
      <SubjectAnnouncementBanner subjectId={subjectId} />

      {/* Progress card */}
      <div
        className="rounded-xl border bg-card p-4
        flex items-center gap-4"
      >
        {/* Circular progress ring */}
        <div className="relative h-16 w-16 shrink-0">
          <svg
            className="h-16 w-16 -rotate-90"
            viewBox="0 0 64 64"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/30"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(progressPercent / 100) * 175.93} 175.93`}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center
            justify-center text-xs font-bold"
          >
            {progressPercent}%
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold">
            {completedItems} of {totalItems} items completed
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {progressPercent === 100
              ? 'All done! Great work.'
              : `${totalItems - completedItems} items remaining`}
          </p>
        </div>
      </div>

      {/* Modules list */}
      {modules.length === 0 ? (
        <div
          className="rounded-xl border bg-card p-16
          flex flex-col items-center justify-center gap-3
          text-center"
        >
          <p className="font-medium">No content yet</p>
          <p className="text-sm text-muted-foreground">
            Your teacher will add content here soon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod) => (
            <StudentModuleCard
              key={mod.id}
              module={mod}
              onToggleComplete={handleToggleComplete}
              onNavigate={(itemId) =>
                router.push(
                  `/management/subjects/${subjectId}/items/${itemId}`
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Student Module Card ───

function StudentModuleCard({
  module: mod,
  onToggleComplete,
  onNavigate,
}: {
  module: ModuleWithProgress
  onToggleComplete: (
    itemId: string,
    completed: boolean
  ) => void
  onNavigate: (itemId: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const isLocked = mod.isLocked

  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden
        ${isLocked ? 'opacity-60' : ''}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => !isLocked && setExpanded(!expanded)}
        disabled={isLocked}
        className="flex items-center gap-3 w-full px-4 py-3
          bg-muted/30 text-left min-h-[48px]"
      >
        {isLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <span className="flex-1 text-sm font-semibold truncate">
          {mod.title}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {mod.completedCount}/{mod.totalCount}
        </span>
      </button>

      {/* Items */}
      {expanded && !isLocked && (
        <div className="divide-y">
          {mod.items
            .filter((item) => item.isPublished)
            .map((item) => (
              <StudentItemRow
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onNavigate={onNavigate}
              />
            ))}
        </div>
      )}
    </div>
  )
}

// ─── Student Item Row ───

interface StudentItemWithCompletion extends SubjectModuleItem {
  isCompleted?: boolean
}

function StudentItemRow({
  item,
  onToggleComplete,
  onNavigate,
}: {
  item: StudentItemWithCompletion
  onToggleComplete: (
    itemId: string,
    completed: boolean
  ) => void
  onNavigate: (itemId: string) => void
}) {
  const Icon = ITEM_TYPE_ICONS[item.type] ?? FileText
  const config = ITEM_TYPE_CONFIG[item.type]
  const isCompleted = item.isCompleted ?? false

  return (
    <div
      className="flex items-center gap-3 px-4 py-3
        hover:bg-muted/20 transition-colors"
    >
      {/* Completion checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) =>
          onToggleComplete(item.id, !!checked)
        }
        className="shrink-0"
        aria-label={`Mark ${item.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
      />

      {/* Type icon */}
      <div
        className={`h-8 w-8 rounded-md flex items-center
          justify-center shrink-0 ${config.bgColor}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Title */}
      <button
        type="button"
        onClick={() => onNavigate(item.id)}
        className={`flex-1 min-w-0 text-left text-sm
          font-medium truncate leading-tight
          ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
      >
        {item.title}
      </button>

      {/* Completion indicator */}
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      )}
    </div>
  )
}

// ─── Empty state ───

function EmptyModules({
  onAdd,
}: {
  onAdd: () => void
}) {
  return (
    <div
      className="rounded-xl border bg-card p-16
      flex flex-col items-center justify-center gap-4
      text-center"
    >
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold">No modules yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Organize your course content into modules. Each
          module can contain videos, files, assignments, and
          more.
        </p>
      </div>
      <Button onClick={onAdd} className="min-h-[44px]">
        <Plus className="h-4 w-4 mr-1.5" />
        Create First Module
      </Button>
    </div>
  )
}

// ─── Loading skeleton ───

function ContentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="p-4 bg-muted/30">
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
