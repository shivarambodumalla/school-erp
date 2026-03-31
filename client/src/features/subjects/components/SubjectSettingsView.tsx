'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  Download,
  X,
  Search,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SubjectSettingsData {
  id: string
  name: string
  code: string | null
  logo: string | null
  color: string | null
  description: string | null
  canPreviewFiles: boolean
  canDownloadFiles: boolean
  showGradesToStudents: boolean
  allowLateSubmission: boolean
  latePenaltyPercent: number | null
  completionTrackingEnabled: boolean
  subjectStartDate: string | null
  classYear: {
    classTemplate: { name: string }
    academicYear: { name: string }
  }
  section: { id: string; name: string } | null
  teachers: TeacherInfo[]
}

interface TeacherInfo {
  id: string
  isPrimary: boolean
  role: 'PRIMARY' | 'CO_TEACHER' | 'TA'
  user: { id: string; email: string }
  staff: {
    id: string
    firstName: string
    lastName: string
    photoUrl: string | null
  } | null
}

interface StaffSearchResult {
  id: string
  firstName: string
  lastName: string
  userId: string
  email: string
}

interface Props {
  subjectId: string
}

const COLOR_SWATCHES = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
]

export function SubjectSettingsView({ subjectId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<SubjectSettingsData | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [logo, setLogo] = useState('')
  const [color, setColor] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [description, setDescription] = useState('')
  const [canPreviewFiles, setCanPreviewFiles] = useState(true)
  const [canDownloadFiles, setCanDownloadFiles] = useState(false)
  const [showGradesToStudents, setShowGradesToStudents] =
    useState(true)
  const [allowLateSubmission, setAllowLateSubmission] =
    useState(false)
  const [latePenaltyPercent, setLatePenaltyPercent] = useState('')
  const [completionTracking, setCompletionTracking] =
    useState(false)
  const [subjectStartDate, setSubjectStartDate] = useState('')

  // Danger zone dialogs
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [archiving, setArchiving] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Staff search
  const [staffSearchQuery, setStaffSearchQuery] = useState('')
  const [staffResults, setStaffResults] = useState<
    StaffSearchResult[]
  >([])
  const [searchingStaff, setSearchingStaff] = useState(false)
  const [addingTeacherRole, setAddingTeacherRole] = useState<
    'CO_TEACHER' | 'TA' | null
  >(null)

  const apiBase = `/api/school/subjects/${subjectId}/settings`

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(apiBase)
      if (res.ok) {
        const json =
          (await res.json()) as SubjectSettingsData
        setData(json)
        setName(json.name)
        setCode(json.code ?? '')
        setLogo(json.logo ?? '')
        setColor(json.color ?? '')
        setDescription(json.description ?? '')
        setCanPreviewFiles(json.canPreviewFiles)
        setCanDownloadFiles(json.canDownloadFiles)
        setShowGradesToStudents(json.showGradesToStudents)
        setAllowLateSubmission(json.allowLateSubmission)
        setLatePenaltyPercent(
          json.latePenaltyPercent?.toString() ?? ''
        )
        setCompletionTracking(
          json.completionTrackingEnabled
        )
        setSubjectStartDate(json.subjectStartDate ?? '')
      }
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        code: code.trim() || null,
        logo: logo.trim() || null,
        color: color.trim() || null,
        description: description.trim() || null,
        canPreviewFiles,
        canDownloadFiles,
        showGradesToStudents,
        allowLateSubmission,
        latePenaltyPercent: allowLateSubmission
          ? Number(latePenaltyPercent) || null
          : null,
        completionTrackingEnabled: completionTracking,
        subjectStartDate: subjectStartDate || null,
      }
      const res = await fetch(apiBase, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success('Settings saved')
        fetchSettings()
      } else {
        toast.error('Failed to save settings')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: true }),
        }
      )
      if (res.ok) {
        toast.success('Subject archived')
        router.push('/management/academic')
      } else {
        toast.error('Failed to archive subject')
      }
    } finally {
      setArchiving(false)
      setShowArchiveDialog(false)
    }
  }

  const handleResetProgress = async () => {
    if (resetConfirmText !== 'RESET') return
    setResetting(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetProgress: true }),
        }
      )
      if (res.ok) {
        toast.success('Student progress has been reset')
      } else {
        toast.error('Failed to reset progress')
      }
    } finally {
      setResetting(false)
      setShowResetDialog(false)
      setResetConfirmText('')
    }
  }

  const handleExportData = async () => {
    toast.info('Exporting subject data...')
    const res = await fetch(
      `/api/school/subjects/${subjectId}/export`,
      { method: 'POST' }
    )
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subject-${subjectId}-export.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export complete')
    } else {
      toast.error('Export failed')
    }
  }

  const searchStaff = async (query: string) => {
    if (query.length < 2) {
      setStaffResults([])
      return
    }
    setSearchingStaff(true)
    try {
      const res = await fetch(
        `/api/school/staff?search=${encodeURIComponent(query)}&limit=5`
      )
      if (res.ok) {
        const json = (await res.json()) as {
          staff: StaffSearchResult[]
        }
        setStaffResults(json.staff ?? [])
      }
    } finally {
      setSearchingStaff(false)
    }
  }

  const addTeacher = async (
    staffId: string,
    userId: string,
    role: 'CO_TEACHER' | 'TA'
  ) => {
    const res = await fetch(apiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addTeacher: { staffId, userId, role },
      }),
    })
    if (res.ok) {
      toast.success('Teacher added')
      setAddingTeacherRole(null)
      setStaffSearchQuery('')
      setStaffResults([])
      fetchSettings()
    } else {
      toast.error('Failed to add teacher')
    }
  }

  const removeTeacher = async (teacherId: string) => {
    const res = await fetch(apiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removeTeacherId: teacherId }),
    })
    if (res.ok) {
      toast.success('Teacher removed')
      fetchSettings()
    } else {
      toast.error('Failed to remove teacher')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="h-8 w-8 animate-spin rounded-full
            border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Subject not found
        </p>
      </div>
    )
  }

  const primaryTeacher = data.teachers.find(
    (t) => t.isPrimary
  )
  const coTeachers = data.teachers.filter(
    (t) => !t.isPrimary && t.role === 'CO_TEACHER'
  )
  const assistants = data.teachers.filter(
    (t) => t.role === 'TA'
  )
  const selectedColor =
    color || customColor || ''

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(
                `/management/subjects/${subjectId}`
              )
            }
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              {data.name} &mdash;{' '}
              {data.classYear.classTemplate.name}
              {data.section
                ? ` - ${data.section.name}`
                : ''}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="min-h-[44px]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* CARD 1: Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>
            Name, code, logo, and color for this subject
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Subject Color</Label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => {
                    setColor(swatch.value)
                    setCustomColor('')
                  }}
                  className={`h-8 w-8 rounded-full border-2
                    transition-transform min-h-[32px]
                    min-w-[32px] hover:scale-110
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-ring
                    ${
                      selectedColor === swatch.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                  style={{ backgroundColor: swatch.value }}
                  title={swatch.name}
                />
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <Input
                  value={customColor || color}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomColor(val)
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                      setColor(val)
                    }
                  }}
                  placeholder="#hex"
                  className="w-24 h-8 text-xs"
                />
                {selectedColor && (
                  <div
                    className="h-6 w-6 rounded-full border
                      shrink-0"
                    style={{
                      backgroundColor: selectedColor,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <div className="flex items-center gap-3">
              <Input
                id="logo-url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="min-h-[44px] flex-1"
              />
              {logo && (
                <div
                  className="h-10 w-10 rounded-full border
                    overflow-hidden shrink-0 bg-muted
                    flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt="Logo preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="subject-name">
              Subject Name
            </Label>
            <Input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics"
              className="min-h-[44px]"
            />
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="subject-code">
              Subject Code
            </Label>
            <Input
              id="subject-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MATH-101"
              className="min-h-[44px]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="subject-desc">
              Description
            </Label>
            <Textarea
              id="subject-desc"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Brief description of this subject"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Content Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Content Rules</CardTitle>
          <CardDescription>
            Control how students interact with content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ToggleRow
            id="preview-files"
            label="Can preview files"
            description="Students can view file previews inline"
            checked={canPreviewFiles}
            onCheckedChange={setCanPreviewFiles}
          />

          <ToggleRow
            id="download-files"
            label="Can download files"
            description="Students can download attached files"
            checked={canDownloadFiles}
            onCheckedChange={setCanDownloadFiles}
          />

          <ToggleRow
            id="show-grades"
            label="Show grades to students"
            description="Students can see their own grades"
            checked={showGradesToStudents}
            onCheckedChange={setShowGradesToStudents}
          />

          <div className="space-y-3">
            <ToggleRow
              id="late-submission"
              label="Allow late submissions"
              description="Students can submit after the due date"
              checked={allowLateSubmission}
              onCheckedChange={setAllowLateSubmission}
            />
            {allowLateSubmission && (
              <div className="ml-12 sm:ml-14 space-y-2">
                <Label htmlFor="late-penalty">
                  Late penalty (%)
                </Label>
                <Input
                  id="late-penalty"
                  type="number"
                  min="0"
                  max="100"
                  value={latePenaltyPercent}
                  onChange={(e) =>
                    setLatePenaltyPercent(e.target.value)
                  }
                  placeholder="e.g. 10"
                  className="min-h-[44px] w-32"
                />
              </div>
            )}
          </div>

          <ToggleRow
            id="completion-tracking"
            label="Completion tracking"
            description="Track student progress through content"
            checked={completionTracking}
            onCheckedChange={setCompletionTracking}
          />

          <div className="space-y-2">
            <Label htmlFor="start-date">
              Subject start date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={subjectStartDate}
              onChange={(e) =>
                setSubjectStartDate(e.target.value)
              }
              className="min-h-[44px] w-full sm:w-48"
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3
            text-sm text-muted-foreground">
            <span className="font-medium">LaTeX tip:</span>{' '}
            Math formulas supported in text items using
            LaTeX. Example:{' '}
            <code className="bg-muted px-1 rounded text-xs">
              $x^2 + y^2 = z^2$
            </code>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
          <CardDescription>
            Manage who teaches this subject
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Primary Teacher */}
          {primaryTeacher && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground
                uppercase tracking-wider">
                Primary Teacher
              </Label>
              <TeacherCard
                teacher={primaryTeacher}
                showRemove={false}
              />
            </div>
          )}

          {/* Co-Teachers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground
                uppercase tracking-wider">
                Co-Teachers
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAddingTeacherRole('CO_TEACHER')
                }
                className="min-h-[36px]"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {coTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No co-teachers assigned
              </p>
            ) : (
              <div className="space-y-2">
                {coTeachers.map((t) => (
                  <TeacherCard
                    key={t.id}
                    teacher={t}
                    showRemove
                    onRemove={() => removeTeacher(t.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Teaching Assistants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground
                uppercase tracking-wider">
                Teaching Assistants
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingTeacherRole('TA')}
                className="min-h-[36px]"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {assistants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No teaching assistants assigned
              </p>
            ) : (
              <div className="space-y-2">
                {assistants.map((t) => (
                  <TeacherCard
                    key={t.id}
                    teacher={t}
                    showRemove
                    onRemove={() => removeTeacher(t.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Staff Search Dialog */}
          <Dialog
            open={addingTeacherRole !== null}
            onOpenChange={(v) => {
              if (!v) {
                setAddingTeacherRole(null)
                setStaffSearchQuery('')
                setStaffResults([])
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Add{' '}
                  {addingTeacherRole === 'CO_TEACHER'
                    ? 'Co-Teacher'
                    : 'Teaching Assistant'}
                </DialogTitle>
                <DialogDescription>
                  Search for a staff member to add
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2
                    -translate-y-1/2 h-4 w-4
                    text-muted-foreground" />
                  <Input
                    value={staffSearchQuery}
                    onChange={(e) => {
                      setStaffSearchQuery(e.target.value)
                      searchStaff(e.target.value)
                    }}
                    placeholder="Search by name or email"
                    className="pl-9 min-h-[44px]"
                  />
                </div>
                {searchingStaff && (
                  <div className="flex items-center
                    justify-center py-4">
                    <Loader2 className="h-4 w-4
                      animate-spin text-muted-foreground" />
                  </div>
                )}
                {staffResults.length > 0 && (
                  <div className="space-y-1 max-h-60
                    overflow-y-auto">
                    {staffResults.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() =>
                          addTeacher(
                            staff.id,
                            staff.userId,
                            addingTeacherRole ?? 'CO_TEACHER'
                          )
                        }
                        className="w-full flex items-center
                          gap-3 p-3 rounded-lg
                          hover:bg-accent text-left
                          min-h-[44px] transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full
                          bg-muted flex items-center
                          justify-center text-xs font-medium
                          shrink-0">
                          {staff.firstName[0]}
                          {staff.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium
                            truncate">
                            {staff.firstName}{' '}
                            {staff.lastName}
                          </p>
                          <p className="text-xs
                            text-muted-foreground truncate">
                            {staff.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {staffSearchQuery.length >= 2 &&
                  !searchingStaff &&
                  staffResults.length === 0 && (
                    <p className="text-sm text-muted-foreground
                      text-center py-4">
                      No staff found
                    </p>
                  )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* CARD 4: Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for this subject
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row
            sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Archive subject
              </p>
              <p className="text-xs text-muted-foreground">
                Hides this subject from all views
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(true)}
              className="min-h-[44px] border-destructive
                text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </div>

          <div className="border-t" />

          <div className="flex flex-col gap-3 sm:flex-row
            sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Reset student progress
              </p>
              <p className="text-xs text-muted-foreground">
                Deletes all submissions, attempts, and grades
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              className="min-h-[44px] border-destructive
                text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Progress
            </Button>
          </div>

          <div className="border-t" />

          <div className="flex flex-col gap-3 sm:flex-row
            sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Export subject data
              </p>
              <p className="text-xs text-muted-foreground">
                Download all content as JSON
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              className="min-h-[44px]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Archive Confirm Dialog */}
      <Dialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Subject</DialogTitle>
            <DialogDescription>
              This will hide &ldquo;{data.name}&rdquo; from
              all views. Students and teachers will no longer
              see it. This action can be reversed by an admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchive}
              disabled={archiving}
              className="min-h-[44px]"
            >
              {archiving && (
                <Loader2 className="h-4 w-4 mr-2
                  animate-spin" />
              )}
              Archive Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Progress Confirm Dialog */}
      <Dialog
        open={showResetDialog}
        onOpenChange={(v) => {
          setShowResetDialog(v)
          if (!v) setResetConfirmText('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Student Progress</DialogTitle>
            <DialogDescription>
              This will permanently delete all submissions,
              quiz attempts, and grades for this subject.
              Type <strong>RESET</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={resetConfirmText}
            onChange={(e) =>
              setResetConfirmText(e.target.value)
            }
            placeholder='Type "RESET" to confirm'
            className="min-h-[44px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetProgress}
              disabled={
                resetting ||
                resetConfirmText !== 'RESET'
              }
              className="min-h-[44px]"
            >
              {resetting && (
                <Loader2 className="h-4 w-4 mr-2
                  animate-spin" />
              )}
              Reset All Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Sub-components ---

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}

function TeacherCard({
  teacher,
  showRemove,
  onRemove,
}: {
  teacher: TeacherInfo
  showRemove: boolean
  onRemove?: () => void
}) {
  const displayName = teacher.staff
    ? `${teacher.staff.firstName} ${teacher.staff.lastName}`
    : teacher.user.email.split('@')[0]

  const initials = teacher.staff
    ? `${teacher.staff.firstName[0]}${teacher.staff.lastName[0]}`
    : teacher.user.email[0].toUpperCase()

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg
      border bg-card">
      <div className="h-9 w-9 rounded-full bg-muted
        flex items-center justify-center text-xs
        font-medium shrink-0">
        {teacher.staff?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teacher.staff.photoUrl}
            alt={displayName}
            className="h-full w-full rounded-full
              object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {teacher.user.email}
        </p>
      </div>
      {teacher.isPrimary && (
        <Badge variant="secondary" className="shrink-0">
          Primary
        </Badge>
      )}
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground
            hover:text-destructive shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
