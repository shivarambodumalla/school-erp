'use client'

import { useState, useCallback } from 'react'
import {
  Video,
  FileText,
  Type,
  Link2,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Radio,
  Megaphone,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MarkdownEditor } from './MarkdownEditor'
import type { ModuleItemType } from '../lms-types'

// ─── Type grid config ───

const ITEM_TYPES: {
  type: ModuleItemType
  label: string
  icon: typeof Video
  color: string
  description: string
}[] = [
  {
    type: 'VIDEO',
    label: 'Video',
    icon: Video,
    color: 'text-red-600 bg-red-50',
    description: 'YouTube or uploaded video',
  },
  {
    type: 'FILE',
    label: 'File',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
    description: 'PDF, document, or slides',
  },
  {
    type: 'TEXT',
    label: 'Text',
    icon: Type,
    color: 'text-gray-600 bg-gray-50',
    description: 'Rich text with formulas',
  },
  {
    type: 'LINK',
    label: 'Link',
    icon: Link2,
    color: 'text-cyan-600 bg-cyan-50',
    description: 'External web resource',
  },
  {
    type: 'ASSIGNMENT',
    label: 'Assignment',
    icon: ClipboardList,
    color: 'text-violet-600 bg-violet-50',
    description: 'Submissions with grading',
  },
  {
    type: 'QUIZ',
    label: 'Quiz',
    icon: HelpCircle,
    color: 'text-amber-600 bg-amber-50',
    description: 'Auto-graded questions',
  },
  {
    type: 'DISCUSSION',
    label: 'Discussion',
    icon: MessageSquare,
    color: 'text-teal-600 bg-teal-50',
    description: 'Threaded conversation',
  },
  {
    type: 'LIVE_CLASS',
    label: 'Live Class',
    icon: Radio,
    color: 'text-green-600 bg-green-50',
    description: 'Scheduled video session',
  },
  {
    type: 'ANNOUNCEMENT',
    label: 'Announcement',
    icon: Megaphone,
    color: 'text-orange-600 bg-orange-50',
    description: 'Notice for students',
  },
]

// ─── Form state type ───

interface ItemFormData {
  title: string
  description: string
  topicTag: string
  isPublished: boolean
  scheduledAt: string
  // LINK
  url: string
  openInNewTab: boolean
  // TEXT
  content: string
  // FILE
  fileUrl: string
  fileName: string
  canPreview: boolean
  canDownload: boolean
  estimatedMinutes: string
  // VIDEO
  videoDuration: string
  // ASSIGNMENT
  dueDate: string
  totalMarks: string
  instructions: string
  allowLateSubmission: boolean
  maxAttempts: string
  isGroupAssignment: boolean
  enableSimilarityCheck: boolean
  // DISCUSSION
  prompt: string
  allowAnonymous: boolean
  closeDate: string
  // LIVE_CLASS
  platform: string
  meetUrl: string
  agenda: string
  // ANNOUNCEMENT
  isUrgent: boolean
  isPinned: boolean
  expiresAt: string
}

const INITIAL_FORM: ItemFormData = {
  title: '',
  description: '',
  topicTag: '',
  isPublished: true,
  scheduledAt: '',
  url: '',
  openInNewTab: true,
  content: '',
  fileUrl: '',
  fileName: '',
  canPreview: true,
  canDownload: false,
  estimatedMinutes: '',
  videoDuration: '',
  dueDate: '',
  totalMarks: '',
  instructions: '',
  allowLateSubmission: false,
  maxAttempts: '1',
  isGroupAssignment: false,
  enableSimilarityCheck: false,
  prompt: '',
  allowAnonymous: false,
  closeDate: '',
  platform: 'GOOGLE_MEET',
  meetUrl: '',
  agenda: '',
  isUrgent: false,
  isPinned: false,
  expiresAt: '',
}

// ─── Props ───

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  moduleId: string
  onCreated: () => void
}

export function AddModuleItemSheet({
  open,
  onOpenChange,
  subjectId,
  moduleId,
  onCreated,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedType, setSelectedType] =
    useState<ModuleItemType | null>(null)
  const [form, setForm] = useState<ItemFormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const handleTypeSelect = (type: ModuleItemType) => {
    setSelectedType(type)
    setForm(INITIAL_FORM)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setSelectedType(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(1)
      setSelectedType(null)
      setForm(INITIAL_FORM)
    }
    onOpenChange(isOpen)
  }

  const updateField = useCallback(
    <K extends keyof ItemFormData>(
      key: K,
      value: ItemFormData[K]
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleSubmit = async () => {
    if (!selectedType || !form.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const body = {
        type: selectedType,
        title: form.title.trim(),
        description: form.description.trim() || null,
        topicTag: form.topicTag.trim() || null,
        isPublished: form.isPublished,
        scheduledAt: form.scheduledAt || null,
        // Type-specific
        ...(selectedType === 'LINK' && {
          url: form.url,
          openInNewTab: form.openInNewTab,
        }),
        ...(selectedType === 'TEXT' && {
          content: form.content,
        }),
        ...(selectedType === 'FILE' && {
          fileUrl: form.fileUrl,
          fileName: form.fileName,
          canPreview: form.canPreview,
          canDownload: form.canDownload,
          estimatedMinutes: form.estimatedMinutes
            ? Number(form.estimatedMinutes)
            : null,
        }),
        ...(selectedType === 'VIDEO' && {
          url: form.url,
          videoDuration: form.videoDuration
            ? Number(form.videoDuration)
            : null,
        }),
        ...(selectedType === 'ASSIGNMENT' && {
          dueDate: form.dueDate || null,
          totalMarks: form.totalMarks
            ? Number(form.totalMarks)
            : null,
          instructions: form.instructions || null,
          allowLateSubmission: form.allowLateSubmission,
          maxAttempts: form.maxAttempts
            ? Number(form.maxAttempts)
            : 1,
          isGroupAssignment: form.isGroupAssignment,
          enableSimilarityCheck: form.enableSimilarityCheck,
        }),
        ...(selectedType === 'QUIZ' && {
          // Quiz builder is a separate flow
        }),
        ...(selectedType === 'DISCUSSION' && {
          prompt: form.prompt,
          allowAnonymous: form.allowAnonymous,
          closeDate: form.closeDate || null,
        }),
        ...(selectedType === 'LIVE_CLASS' && {
          platform: form.platform,
          meetUrl: form.meetUrl,
          scheduledAt: form.scheduledAt || null,
          videoDuration: form.videoDuration
            ? Number(form.videoDuration)
            : null,
          agenda: form.agenda || null,
        }),
        ...(selectedType === 'ANNOUNCEMENT' && {
          content: form.content,
          isUrgent: form.isUrgent,
          isPinned: form.isPinned,
          expiresAt: form.expiresAt || null,
        }),
      }

      const res = await fetch(
        `/api/school/subjects/${subjectId}/modules/${moduleId}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to create item')
      }

      toast.success('Item added')
      handleClose(false)
      onCreated()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Something went wrong'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          {step === 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="w-fit -ml-2 mb-1 h-8 gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          )}
          <SheetTitle>
            {step === 1
              ? 'Add Item'
              : `New ${ITEM_TYPES.find((t) => t.type === selectedType)?.label ?? 'Item'}`}
          </SheetTitle>
          <SheetDescription>
            {step === 1
              ? 'Choose the type of content to add'
              : 'Fill in the details below'}
          </SheetDescription>
        </SheetHeader>

        {step === 1 ? (
          <TypeGrid onSelect={handleTypeSelect} />
        ) : selectedType ? (
          <ItemForm
            type={selectedType}
            form={form}
            updateField={updateField}
            onSubmit={handleSubmit}
            saving={saving}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

// ─── Step 1: Type selection grid ───

function TypeGrid({
  onSelect,
}: {
  onSelect: (type: ModuleItemType) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
      {ITEM_TYPES.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onSelect(item.type)}
            className="flex flex-col items-center gap-2 p-4
              rounded-xl border transition-colors
              hover:border-primary hover:bg-accent
              min-h-[88px] text-center"
          >
            <div
              className={`h-10 w-10 rounded-lg flex items-center
                justify-center ${item.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Step 2: Item form ───

function ItemForm({
  type,
  form,
  updateField,
  onSubmit,
  saving,
}: {
  type: ModuleItemType
  form: ItemFormData
  updateField: <K extends keyof ItemFormData>(
    key: K,
    value: ItemFormData[K]
  ) => void
  onSubmit: () => void
  saving: boolean
}) {
  return (
    <div className="space-y-5 pt-2 pb-6">
      {/* Common fields */}
      <CommonFields form={form} updateField={updateField} />

      {/* Type-specific fields */}
      {type === 'LINK' && (
        <LinkFields form={form} updateField={updateField} />
      )}
      {type === 'TEXT' && (
        <TextField form={form} updateField={updateField} />
      )}
      {type === 'FILE' && (
        <FileFields form={form} updateField={updateField} />
      )}
      {type === 'VIDEO' && (
        <VideoFields form={form} updateField={updateField} />
      )}
      {type === 'ASSIGNMENT' && (
        <AssignmentFields
          form={form}
          updateField={updateField}
        />
      )}
      {type === 'QUIZ' && <QuizFields />}
      {type === 'DISCUSSION' && (
        <DiscussionFields
          form={form}
          updateField={updateField}
        />
      )}
      {type === 'LIVE_CLASS' && (
        <LiveClassFields
          form={form}
          updateField={updateField}
        />
      )}
      {type === 'ANNOUNCEMENT' && (
        <AnnouncementFields
          form={form}
          updateField={updateField}
        />
      )}

      {/* Publish controls */}
      <PublishControls form={form} updateField={updateField} />

      {/* Submit */}
      <Button
        type="button"
        onClick={onSubmit}
        disabled={saving || !form.title.trim()}
        className="w-full min-h-[44px]"
      >
        {saving && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        {saving ? 'Adding...' : 'Add Item'}
      </Button>
    </div>
  )
}

// ─── Shared field helpers ───

type FieldProps = {
  form: ItemFormData
  updateField: <K extends keyof ItemFormData>(
    key: K,
    value: ItemFormData[K]
  ) => void
}

function CommonFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="item-title">Title</Label>
        <Input
          id="item-title"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Enter title"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="item-description">
          Description{' '}
          <span className="text-muted-foreground font-normal">
            (optional)
          </span>
        </Label>
        <Textarea
          id="item-description"
          value={form.description}
          onChange={(e) =>
            updateField('description', e.target.value)
          }
          placeholder="Brief description"
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="item-topic">
          Topic tag{' '}
          <span className="text-muted-foreground font-normal">
            (optional)
          </span>
        </Label>
        <Input
          id="item-topic"
          value={form.topicTag}
          onChange={(e) =>
            updateField('topicTag', e.target.value)
          }
          placeholder="e.g. Unit 1, Chapter 3"
        />
      </div>
    </>
  )
}

function LinkFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="link-url">URL</Label>
        <Input
          id="link-url"
          type="url"
          value={form.url}
          onChange={(e) => updateField('url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="link-new-tab"
          checked={form.openInNewTab}
          onCheckedChange={(val) =>
            updateField('openInNewTab', val)
          }
        />
        <Label htmlFor="link-new-tab" className="cursor-pointer">
          Open in new tab
        </Label>
      </div>
    </>
  )
}

function TextField({ form, updateField }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>Content</Label>
      <MarkdownEditor
        value={form.content}
        onChange={(val) => updateField('content', val)}
        placeholder="Write content with Markdown and LaTeX formulas..."
      />
    </div>
  )
}

function FileFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="file-url">File URL</Label>
        <Input
          id="file-url"
          type="url"
          value={form.fileUrl}
          onChange={(e) =>
            updateField('fileUrl', e.target.value)
          }
          placeholder="https://..."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="file-name">File name</Label>
        <Input
          id="file-name"
          value={form.fileName}
          onChange={(e) =>
            updateField('fileName', e.target.value)
          }
          placeholder="document.pdf"
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch
            id="file-preview"
            checked={form.canPreview}
            onCheckedChange={(val) =>
              updateField('canPreview', val)
            }
          />
          <Label
            htmlFor="file-preview"
            className="cursor-pointer"
          >
            Allow preview
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="file-download"
            checked={form.canDownload}
            onCheckedChange={(val) =>
              updateField('canDownload', val)
            }
          />
          <Label
            htmlFor="file-download"
            className="cursor-pointer"
          >
            Allow download
          </Label>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="file-minutes">
          Estimated time (minutes)
        </Label>
        <Input
          id="file-minutes"
          type="number"
          min={0}
          value={form.estimatedMinutes}
          onChange={(e) =>
            updateField('estimatedMinutes', e.target.value)
          }
          placeholder="15"
        />
      </div>
    </>
  )
}

function VideoFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          type="url"
          value={form.url}
          onChange={(e) => updateField('url', e.target.value)}
          placeholder="YouTube or video URL"
        />
        <p className="text-xs text-muted-foreground">
          Supports YouTube, Vimeo, or direct video links
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="video-duration">
          Duration (minutes)
        </Label>
        <Input
          id="video-duration"
          type="number"
          min={0}
          value={form.videoDuration}
          onChange={(e) =>
            updateField('videoDuration', e.target.value)
          }
          placeholder="30"
        />
      </div>
    </>
  )
}

function AssignmentFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="assign-due">Due date</Label>
        <Input
          id="assign-due"
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) =>
            updateField('dueDate', e.target.value)
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="assign-marks">Total marks</Label>
        <Input
          id="assign-marks"
          type="number"
          min={0}
          value={form.totalMarks}
          onChange={(e) =>
            updateField('totalMarks', e.target.value)
          }
          placeholder="100"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="assign-instructions">
          Instructions
        </Label>
        <MarkdownEditor
          value={form.instructions}
          onChange={(val) => updateField('instructions', val)}
          placeholder="Assignment instructions..."
          minRows={4}
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="assign-late"
            checked={form.allowLateSubmission}
            onCheckedChange={(val) =>
              updateField('allowLateSubmission', val)
            }
          />
          <Label
            htmlFor="assign-late"
            className="cursor-pointer"
          >
            Allow late submissions
          </Label>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assign-attempts">Max attempts</Label>
          <Input
            id="assign-attempts"
            type="number"
            min={1}
            value={form.maxAttempts}
            onChange={(e) =>
              updateField('maxAttempts', e.target.value)
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="assign-group"
            checked={form.isGroupAssignment}
            onCheckedChange={(val) =>
              updateField('isGroupAssignment', val)
            }
          />
          <Label
            htmlFor="assign-group"
            className="cursor-pointer"
          >
            Group assignment
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="assign-similarity"
            checked={form.enableSimilarityCheck}
            onCheckedChange={(val) =>
              updateField('enableSimilarityCheck', val)
            }
          />
          <Label
            htmlFor="assign-similarity"
            className="cursor-pointer"
          >
            Enable similarity check
          </Label>
        </div>
      </div>
    </>
  )
}

function QuizFields() {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 text-center">
      <p className="text-sm text-muted-foreground">
        After creating this item, use the quiz builder to add
        questions.
      </p>
    </div>
  )
}

function DiscussionFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="discuss-prompt">Discussion prompt</Label>
        <Textarea
          id="discuss-prompt"
          value={form.prompt}
          onChange={(e) =>
            updateField('prompt', e.target.value)
          }
          placeholder="What should students discuss?"
          rows={3}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="discuss-anon"
          checked={form.allowAnonymous}
          onCheckedChange={(val) =>
            updateField('allowAnonymous', val)
          }
        />
        <Label
          htmlFor="discuss-anon"
          className="cursor-pointer"
        >
          Allow anonymous replies
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="discuss-close">
          Close date{' '}
          <span className="text-muted-foreground font-normal">
            (optional)
          </span>
        </Label>
        <Input
          id="discuss-close"
          type="datetime-local"
          value={form.closeDate}
          onChange={(e) =>
            updateField('closeDate', e.target.value)
          }
        />
      </div>
    </>
  )
}

function LiveClassFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="live-platform">Platform</Label>
        <select
          id="live-platform"
          value={form.platform}
          onChange={(e) =>
            updateField('platform', e.target.value)
          }
          className="flex h-11 w-full rounded-md border border-input
            bg-transparent px-3 py-2 text-sm shadow-sm
            focus-visible:outline-none focus-visible:ring-1
            focus-visible:ring-ring"
        >
          <option value="GOOGLE_MEET">Google Meet</option>
          <option value="ZOOM">Zoom</option>
          <option value="MS_TEAMS">Microsoft Teams</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="live-url">Meeting URL</Label>
        <Input
          id="live-url"
          type="url"
          value={form.meetUrl}
          onChange={(e) =>
            updateField('meetUrl', e.target.value)
          }
          placeholder="https://meet.google.com/..."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="live-scheduled">
          Scheduled date & time
        </Label>
        <Input
          id="live-scheduled"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) =>
            updateField('scheduledAt', e.target.value)
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="live-duration">
          Duration (minutes)
        </Label>
        <Input
          id="live-duration"
          type="number"
          min={0}
          value={form.videoDuration}
          onChange={(e) =>
            updateField('videoDuration', e.target.value)
          }
          placeholder="45"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="live-agenda">
          Agenda{' '}
          <span className="text-muted-foreground font-normal">
            (optional)
          </span>
        </Label>
        <Textarea
          id="live-agenda"
          value={form.agenda}
          onChange={(e) =>
            updateField('agenda', e.target.value)
          }
          placeholder="Topics to be covered..."
          rows={3}
        />
      </div>
    </>
  )
}

function AnnouncementFields({ form, updateField }: FieldProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label>Content</Label>
        <MarkdownEditor
          value={form.content}
          onChange={(val) => updateField('content', val)}
          placeholder="Announcement content..."
          minRows={4}
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="ann-urgent"
            checked={form.isUrgent}
            onCheckedChange={(val) =>
              updateField('isUrgent', val)
            }
          />
          <Label
            htmlFor="ann-urgent"
            className="cursor-pointer"
          >
            Urgent
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="ann-pin"
            checked={form.isPinned}
            onCheckedChange={(val) =>
              updateField('isPinned', val)
            }
          />
          <Label htmlFor="ann-pin" className="cursor-pointer">
            Pin to top
          </Label>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ann-expires">
            Expires{' '}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="ann-expires"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) =>
              updateField('expiresAt', e.target.value)
            }
          />
        </div>
      </div>
    </>
  )
}

function PublishControls({ form, updateField }: FieldProps) {
  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center gap-3">
        <Switch
          id="item-published"
          checked={form.isPublished}
          onCheckedChange={(val) =>
            updateField('isPublished', val)
          }
        />
        <Label
          htmlFor="item-published"
          className="cursor-pointer"
        >
          Publish immediately
        </Label>
      </div>
      {!form.isPublished && (
        <div className="space-y-1.5">
          <Label htmlFor="item-schedule">Schedule for</Label>
          <Input
            id="item-schedule"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) =>
              updateField('scheduledAt', e.target.value)
            }
          />
        </div>
      )}
    </div>
  )
}
