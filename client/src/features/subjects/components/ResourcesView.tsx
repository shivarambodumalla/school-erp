'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { usePortal } from '@/hooks/usePortal'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Plus,
  Loader2,
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Search,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

// ─── Types ───

interface SubjectResource {
  id: string
  name: string
  fileUrl: string
  description: string | null
  mimeType: string | null
  fileSize: number | null
  downloadCount: number
  createdAt: string
}

type FilterType = 'ALL' | 'PDF' | 'VIDEO' | 'IMAGE' | 'DOCUMENT'

// ─── Constants ───

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'PDF', value: 'PDF' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Image', value: 'IMAGE' },
  { label: 'Document', value: 'DOCUMENT' },
]

const MIME_CATEGORIES: Record<
  string,
  { icon: typeof FileText; color: string; bg: string }
> = {
  'application/pdf': {
    icon: FileText,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  'video/mp4': {
    icon: Video,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  'video/webm': {
    icon: Video,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  'image/jpeg': {
    icon: ImageIcon,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  'image/png': {
    icon: ImageIcon,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  'image/gif': {
    icon: ImageIcon,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  'image/webp': {
    icon: ImageIcon,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
}

function getIconForMime(mimeType: string | null): {
  icon: typeof FileText
  color: string
  bg: string
} {
  if (!mimeType) {
    return { icon: File, color: 'text-gray-600', bg: 'bg-gray-50' }
  }
  if (MIME_CATEGORIES[mimeType]) {
    return MIME_CATEGORIES[mimeType]
  }
  if (mimeType.startsWith('video/')) {
    return { icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' }
  }
  if (mimeType.startsWith('image/')) {
    return {
      icon: ImageIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
    }
  }
  if (
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  ) {
    return {
      icon: FileText,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    }
  }
  return { icon: File, color: 'text-gray-600', bg: 'bg-gray-50' }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function matchesFilter(
  resource: SubjectResource,
  filter: FilterType
): boolean {
  if (filter === 'ALL') return true
  const mime = resource.mimeType ?? ''
  switch (filter) {
    case 'PDF':
      return mime === 'application/pdf'
    case 'VIDEO':
      return mime.startsWith('video/')
    case 'IMAGE':
      return mime.startsWith('image/')
    case 'DOCUMENT':
      return (
        mime.includes('document') ||
        mime.includes('word') ||
        mime.includes('spreadsheet') ||
        mime.includes('presentation') ||
        mime.includes('text/')
      )
    default:
      return true
  }
}

// ─── Props ───

interface Props {
  subjectId: string
}

export function ResourcesView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const { isTeacher, isAdmin } = usePortal()
  const confirm = useConfirm()
  const isEditor = isTeacher || isAdmin
  const [resources, setResources] = useState<SubjectResource[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/resources?${params}`
      )
      if (!res.ok) {
        setResources([])
        return
      }
      const data = (await res.json()) as {
        resources: SubjectResource[]
      }
      setResources(data.resources)
    } catch {
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const handleDelete = async (resourceId: string) => {
    const ok = await confirm({
      title: 'Delete Resource',
      description: 'Are you sure you want to delete this resource?',
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/resources/${resourceId}?${params}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        toast.success('Resource deleted')
        setResources((prev) =>
          prev.filter((r) => r.id !== resourceId)
        )
      } else {
        toast.error('Failed to delete resource')
      }
    } catch {
      toast.error('Failed to delete resource')
    }
  }

  const handleDownload = async (resource: SubjectResource) => {
    try {
      const params = new URLSearchParams()
      addParams(params)
      // Increment download count
      await fetch(
        `/api/school/subjects/${subjectId}/resources/${resource.id}/download?${params}`,
        { method: 'POST' }
      )
      // Update local count
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id
            ? { ...r, downloadCount: r.downloadCount + 1 }
            : r
        )
      )
      // Open download
      window.open(resource.fileUrl, '_blank')
    } catch {
      window.open(resource.fileUrl, '_blank')
    }
  }

  const handleCreated = () => {
    setShowUpload(false)
    fetchResources()
  }

  // Filter and search
  const filtered = resources.filter((r) => {
    if (!matchesFilter(r, filter)) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isEditor && (
          <Button
            onClick={() => setShowUpload(true)}
            className="min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Upload Resource
          </Button>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2
            -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="pl-9 min-h-[44px] w-full sm:w-64"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs
                font-medium transition-colors min-h-[36px]
                ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin
            text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyResources
          hasResources={resources.length > 0}
          isEditor={isEditor}
          onUploadClick={() => setShowUpload(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isEditor={isEditor}
              onDelete={() => handleDelete(resource.id)}
              onDownload={() => handleDownload(resource)}
            />
          ))}
        </div>
      )}

      {/* Upload Sheet */}
      {isEditor && (
        <ResourceUploadSheet
          open={showUpload}
          onOpenChange={setShowUpload}
          subjectId={subjectId}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

// ─── Empty State ───

function EmptyResources({
  hasResources,
  isEditor,
  onUploadClick,
}: {
  hasResources: boolean
  isEditor: boolean
  onUploadClick: () => void
}) {
  return (
    <div className="rounded-xl border bg-card p-16
      flex flex-col items-center justify-center gap-4
      text-center">
      <div className="h-12 w-12 rounded-full bg-muted
        flex items-center justify-center">
        <FolderOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-semibold">
        {hasResources ? 'No matching resources' : 'No resources yet'}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasResources
          ? 'Try adjusting your search or filter.'
          : isEditor
            ? 'Upload files for your students to access.'
            : 'Your teacher has not uploaded any resources yet.'}
      </p>
      {isEditor && !hasResources && (
        <Button
          onClick={onUploadClick}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Upload Resource
        </Button>
      )}
    </div>
  )
}

// ─── Resource Card ───

interface ResourceCardProps {
  resource: SubjectResource
  isEditor: boolean
  onDelete: () => void
  onDownload: () => void
}

function ResourceCard({
  resource,
  isEditor,
  onDelete,
  onDownload,
}: ResourceCardProps) {
  const { icon: Icon, color, bg } = getIconForMime(
    resource.mimeType
  )

  return (
    <div className="rounded-xl border bg-card p-4
      flex flex-col gap-3 hover:border-primary/50
      transition-colors">
      {/* File icon */}
      <div className={`h-12 w-12 rounded-lg flex items-center
        justify-center ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {resource.name}
        </p>
        {resource.description && (
          <p className="text-sm text-muted-foreground
            line-clamp-2 mt-0.5">
            {resource.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs
        text-muted-foreground">
        <span>{formatFileSize(resource.fileSize)}</span>
        <span>{formatDate(resource.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {resource.downloadCount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex-1 min-h-[44px]"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        {isEditor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="min-h-[44px] min-w-[44px] p-0
              text-destructive hover:text-destructive"
            title="Delete resource"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Resource Upload Sheet ───

interface UploadSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  onCreated: () => void
}

function ResourceUploadSheet({
  open,
  onOpenChange,
  subjectId,
  onCreated,
}: UploadSheetProps) {
  const { addParams } = useInstitutionId()
  const [name, setName] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [description, setDescription] = useState('')
  const [mimeType, setMimeType] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setFileUrl('')
    setDescription('')
    setMimeType('')
    setSaving(false)
  }

  const handleClose = (val: boolean) => {
    if (!val) reset()
    onOpenChange(val)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !fileUrl.trim()) return
    setSaving(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/resources?${params}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            fileUrl: fileUrl.trim(),
            description: description.trim() || undefined,
            mimeType: mimeType || undefined,
          }),
        }
      )
      if (res.ok) {
        toast.success('Resource uploaded')
        reset()
        onCreated()
      } else {
        toast.error('Failed to upload resource')
      }
    } catch {
      toast.error('Failed to upload resource')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Upload Resource</SheetTitle>
          <SheetDescription>
            Add a file for students to access
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="res-name">Name</Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chapter 1 Notes"
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-url">File URL</Label>
            <Input
              id="res-url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-desc">
              Description
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </Label>
            <Textarea
              id="res-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this resource"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-mime">File Type</Label>
            <Select
              value={mimeType}
              onValueChange={setMimeType}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application/pdf">
                  PDF
                </SelectItem>
                <SelectItem value="video/mp4">
                  Video (MP4)
                </SelectItem>
                <SelectItem value="video/webm">
                  Video (WebM)
                </SelectItem>
                <SelectItem value="image/jpeg">
                  Image (JPEG)
                </SelectItem>
                <SelectItem value="image/png">
                  Image (PNG)
                </SelectItem>
                <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                  Word Document
                </SelectItem>
                <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                  Excel Spreadsheet
                </SelectItem>
                <SelectItem value="application/vnd.openxmlformats-officedocument.presentationml.presentation">
                  PowerPoint
                </SelectItem>
                <SelectItem value="text/plain">
                  Text File
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={
              saving || !name.trim() || !fileUrl.trim()
            }
            className="w-full min-h-[44px]"
          >
            {saving && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Upload Resource
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
