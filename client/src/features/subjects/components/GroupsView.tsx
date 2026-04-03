'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { usePortal } from '@/hooks/usePortal'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Plus,
  Loader2,
  Users,
  Shuffle,
  Trash2,
  Wand2,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import { toast } from 'sonner'

// ─── Types ───

type AssignmentType = 'RANDOM' | 'SELF_SELECT' | 'MANUAL'

interface GroupMember {
  id: string
  studentId: string
  studentName: string
  photoUrl: string | null
}

interface SubjectGroup {
  id: string
  name: string
  members: GroupMember[]
}

interface GroupSet {
  id: string
  name: string
  assignmentType: AssignmentType
  minSize: number
  maxSize: number
  groups: SubjectGroup[]
  _count: { groups: number; members: number }
}

// ─── Constants ───

const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  RANDOM: 'Random',
  SELF_SELECT: 'Self Select',
  MANUAL: 'Manual',
}

const ASSIGNMENT_TYPE_COLORS: Record<AssignmentType, string> = {
  RANDOM: 'bg-blue-100 text-blue-700',
  SELF_SELECT: 'bg-amber-100 text-amber-700',
  MANUAL: 'bg-violet-100 text-violet-700',
}

// ─── Props ───

interface Props {
  subjectId: string
}

export function GroupsView({ subjectId }: Props) {
  const { isStudent } = usePortal()

  if (isStudent) {
    return <StudentGroupsView subjectId={subjectId} />
  }

  return <TeacherGroupsView subjectId={subjectId} />
}

// ═══════════════════════════════════════════════════
// TEACHER VIEW
// ═══════════════════════════════════════════════════

function TeacherGroupsView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const confirm = useConfirm()
  const [groupSets, setGroupSets] = useState<GroupSet[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedSets, setExpandedSets] = useState<Set<string>>(
    new Set()
  )

  const fetchGroupSets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups?${params}`
      )
      if (!res.ok) {
        setGroupSets([])
        return
      }
      const data = (await res.json()) as { groupSets: GroupSet[] }
      setGroupSets(data.groupSets)
    } catch {
      setGroupSets([])
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchGroupSets()
  }, [fetchGroupSets])

  const toggleExpand = (setId: string) => {
    setExpandedSets((prev) => {
      const next = new Set(prev)
      if (next.has(setId)) {
        next.delete(setId)
      } else {
        next.add(setId)
      }
      return next
    })
  }

  const handleAutoGenerate = async (setId: string) => {
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups/${setId}/auto-generate?${params}`,
        { method: 'POST' }
      )
      if (res.ok) {
        toast.success('Groups auto-generated')
        fetchGroupSets()
      } else {
        toast.error('Failed to auto-generate groups')
      }
    } catch {
      toast.error('Failed to auto-generate groups')
    }
  }

  const handleShuffle = async (setId: string) => {
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups/${setId}/shuffle?${params}`,
        { method: 'POST' }
      )
      if (res.ok) {
        toast.success('Groups shuffled')
        fetchGroupSets()
      } else {
        toast.error('Failed to shuffle groups')
      }
    } catch {
      toast.error('Failed to shuffle groups')
    }
  }

  const handleDeleteSet = async (setId: string) => {
    const ok = await confirm({
      title: 'Delete Group Set',
      description: 'Delete this group set and all its groups?',
      destructive: true,
      confirmLabel: 'Delete',
      note: 'This action cannot be undone.',
    })
    if (!ok) return
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups/${setId}?${params}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        toast.success('Group set deleted')
        setGroupSets((prev) => prev.filter((s) => s.id !== setId))
      } else {
        toast.error('Failed to delete group set')
      }
    } catch {
      toast.error('Failed to delete group set')
    }
  }

  const handleCreated = () => {
    setShowCreate(false)
    fetchGroupSets()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize students into working groups
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Group Set
        </Button>
      </div>

      {/* Group Sets */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : groupSets.length === 0 ? (
        <EmptyGroupSets onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-4">
          {groupSets.map((gs) => (
            <GroupSetCard
              key={gs.id}
              groupSet={gs}
              subjectId={subjectId}
              expanded={expandedSets.has(gs.id)}
              onToggle={() => toggleExpand(gs.id)}
              onAutoGenerate={() => handleAutoGenerate(gs.id)}
              onShuffle={() => handleShuffle(gs.id)}
              onDelete={() => handleDeleteSet(gs.id)}
              onRefresh={fetchGroupSets}
            />
          ))}
        </div>
      )}

      {/* Create Group Set Sheet */}
      <CreateGroupSetSheet
        open={showCreate}
        onOpenChange={setShowCreate}
        subjectId={subjectId}
        onCreated={handleCreated}
      />
    </div>
  )
}

// ─── Empty State ───

function EmptyGroupSets({
  onCreateClick,
}: {
  onCreateClick: () => void
}) {
  return (
    <div className="rounded-xl border bg-card p-16
      flex flex-col items-center justify-center gap-4
      text-center">
      <div className="h-12 w-12 rounded-full bg-muted
        flex items-center justify-center">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-semibold">No group sets yet</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Create a group set to organize students into teams
        for collaborative work.
      </p>
      <Button
        onClick={onCreateClick}
        className="min-h-[44px]"
      >
        <Plus className="h-4 w-4 mr-1" />
        Create Group Set
      </Button>
    </div>
  )
}

// ─── Group Set Card ───

interface GroupSetCardProps {
  groupSet: GroupSet
  subjectId: string
  expanded: boolean
  onToggle: () => void
  onAutoGenerate: () => void
  onShuffle: () => void
  onDelete: () => void
  onRefresh: () => void
}

function GroupSetCard({
  groupSet,
  subjectId,
  expanded,
  onToggle,
  onAutoGenerate,
  onShuffle,
  onDelete,
  onRefresh,
}: GroupSetCardProps) {
  return (
    <div className="rounded-xl border bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4
          text-left min-h-[56px] hover:bg-muted/50
          transition-colors rounded-t-xl"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0
            text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0
            text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold truncate">
              {groupSet.name}
            </span>
            <Badge
              className={
                ASSIGNMENT_TYPE_COLORS[groupSet.assignmentType]
              }
            >
              {ASSIGNMENT_TYPE_LABELS[groupSet.assignmentType]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {groupSet._count.groups} group{groupSet._count.groups !== 1 ? 's' : ''}
            {' \u00B7 '}
            {groupSet._count.members} student{groupSet._count.members !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions - stop propagation so click doesn't toggle */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
            }
          }}
          role="toolbar"
          aria-label="Group set actions"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoGenerate}
            className="min-h-[44px] min-w-[44px] p-0
              hidden sm:flex"
            title="Auto-generate groups"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShuffle}
            className="min-h-[44px] min-w-[44px] p-0
              hidden sm:flex"
            title="Shuffle members"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="min-h-[44px] min-w-[44px] p-0
              text-destructive hover:text-destructive"
            title="Delete group set"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </button>

      {/* Mobile actions row */}
      {expanded && (
        <div className="flex items-center gap-2 px-4 pb-2
          sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={onAutoGenerate}
            className="min-h-[44px] flex-1"
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Generate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShuffle}
            className="min-h-[44px] flex-1"
          >
            <Shuffle className="h-4 w-4 mr-1" />
            Shuffle
          </Button>
        </div>
      )}

      {/* Expanded groups grid */}
      {expanded && (
        <div className="px-4 pb-4 pt-2">
          {groupSet.groups.length === 0 ? (
            <p className="text-sm text-muted-foreground
              text-center py-6">
              No groups yet. Use auto-generate or add groups
              manually.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2
              lg:grid-cols-3 gap-3">
              {groupSet.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  subjectId={subjectId}
                  groupSetId={groupSet.id}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Individual Group Card ───

interface GroupCardProps {
  group: SubjectGroup
  subjectId: string
  groupSetId: string
  onRefresh: () => void
}

function GroupCard({
  group,
  subjectId,
  groupSetId,
  onRefresh,
}: GroupCardProps) {
  const { addParams } = useInstitutionId()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSaveName = async () => {
    if (!editName.trim() || editName === group.name) {
      setEditing(false)
      setEditName(group.name)
      return
    }
    setSaving(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups/${groupSetId}/groups/${group.id}?${params}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName.trim() }),
        }
      )
      if (res.ok) {
        toast.success('Group renamed')
        onRefresh()
      } else {
        toast.error('Failed to rename group')
        setEditName(group.name)
      }
    } catch {
      toast.error('Failed to rename group')
      setEditName(group.name)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  const handleAddMember = async () => {
    // In a real implementation, this would open a student picker.
    // For now it calls the add endpoint with a prompt.
    toast.info('Select a student to add to this group')
  }

  return (
    <div className="rounded-lg border bg-background p-3
      space-y-3">
      {/* Group Name - inline editable */}
      <div className="flex items-center gap-2">
        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName()
                if (e.key === 'Escape') {
                  setEditing(false)
                  setEditName(group.name)
                }
              }}
              disabled={saving}
              className="h-8 text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveName}
              disabled={saving}
              className="min-h-[44px] min-w-[44px] p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false)
                setEditName(group.name)
              }}
              className="min-h-[44px] min-w-[44px] p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-semibold hover:underline
              text-left truncate flex-1 min-h-[44px]
              flex items-center"
            title="Click to rename"
          >
            {group.name}
          </button>
        )}
      </div>

      {/* Members */}
      <div className="flex flex-wrap gap-1.5">
        {group.members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-1.5 rounded-full
              bg-muted px-2 py-1"
            title={m.studentName}
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {m.studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs truncate max-w-[80px]">
              {m.studentName}
            </span>
          </div>
        ))}
        {group.members.length === 0 && (
          <span className="text-xs text-muted-foreground">
            No members
          </span>
        )}
      </div>

      {/* Add member */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddMember}
        className="w-full min-h-[44px]"
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Add Member
      </Button>
    </div>
  )
}

// ─── Create Group Set Sheet ───

interface CreateGroupSetSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  onCreated: () => void
}

function CreateGroupSetSheet({
  open,
  onOpenChange,
  subjectId,
  onCreated,
}: CreateGroupSetSheetProps) {
  const { addParams } = useInstitutionId()
  const [name, setName] = useState('')
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>('RANDOM')
  const [minSize, setMinSize] = useState('2')
  const [maxSize, setMaxSize] = useState('5')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setAssignmentType('RANDOM')
    setMinSize('2')
    setMaxSize('5')
    setSaving(false)
  }

  const handleClose = (val: boolean) => {
    if (!val) reset()
    onOpenChange(val)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups?${params}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            assignmentType,
            minSize: Number(minSize) || 2,
            maxSize: Number(maxSize) || 5,
          }),
        }
      )
      if (res.ok) {
        toast.success('Group set created')
        reset()
        onCreated()
      } else {
        toast.error('Failed to create group set')
      }
    } catch {
      toast.error('Failed to create group set')
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
          <SheetTitle>Create Group Set</SheetTitle>
          <SheetDescription>
            Organize students into working groups
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="gs-name">Name</Label>
            <Input
              id="gs-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Teams"
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gs-type">Assignment Type</Label>
            <Select
              value={assignmentType}
              onValueChange={(v) =>
                setAssignmentType(v as AssignmentType)
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RANDOM">
                  Random - auto-assign students
                </SelectItem>
                <SelectItem value="SELF_SELECT">
                  Self Select - students choose
                </SelectItem>
                <SelectItem value="MANUAL">
                  Manual - teacher assigns
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gs-min">Min Group Size</Label>
              <Input
                id="gs-min"
                type="number"
                min={1}
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gs-max">Max Group Size</Label>
              <Input
                id="gs-max"
                type="number"
                min={1}
                value={maxSize}
                onChange={(e) => setMaxSize(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {assignmentType === 'RANDOM' && (
            <p className="text-sm text-muted-foreground
              bg-blue-50 rounded-lg p-3">
              Students will be automatically distributed into
              groups when this set is created.
            </p>
          )}

          {assignmentType === 'SELF_SELECT' && (
            <p className="text-sm text-muted-foreground
              bg-amber-50 rounded-lg p-3">
              Students will be able to browse and join open
              groups on their own.
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="w-full min-h-[44px]"
          >
            {saving && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Create Group Set
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ═══════════════════════════════════════════════════
// STUDENT VIEW
// ═══════════════════════════════════════════════════

function StudentGroupsView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const [myGroups, setMyGroups] = useState<{
    groupSet: GroupSet
    group: SubjectGroup
  }[]>([])
  const [openSets, setOpenSets] = useState<GroupSet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStudentGroups = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('view', 'student')
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups?${params}`
      )
      if (!res.ok) return
      const data = (await res.json()) as {
        myGroups: { groupSet: GroupSet; group: SubjectGroup }[]
        openSets: GroupSet[]
      }
      setMyGroups(data.myGroups)
      setOpenSets(data.openSets)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchStudentGroups()
  }, [fetchStudentGroups])

  const handleJoin = async (
    groupSetId: string,
    groupId: string
  ) => {
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/groups/${groupSetId}/groups/${groupId}/join?${params}`,
        { method: 'POST' }
      )
      if (res.ok) {
        toast.success('Joined group')
        fetchStudentGroups()
      } else {
        toast.error('Failed to join group')
      }
    } catch {
      toast.error('Failed to join group')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin
          text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Groups
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your group assignments
        </p>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myGroups.map(({ groupSet, group }) => (
              <div
                key={group.id}
                className="rounded-xl border bg-card p-4 space-y-3"
              >
                <div>
                  <p className="font-semibold">{group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {groupSet.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-1.5
                        rounded-full bg-muted px-2 py-1"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {m.studentName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">
                        {m.studentName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12
          flex flex-col items-center text-center gap-3">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">
            You are not in any groups yet
          </p>
          {openSets.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Browse the open groups below to join one.
            </p>
          )}
        </div>
      )}

      {/* Open Groups (Self Select) */}
      {openSets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Open Groups
          </h2>
          {openSets.map((gs) => (
            <div key={gs.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{gs.name}</span>
                <Badge className={ASSIGNMENT_TYPE_COLORS.SELF_SELECT}>
                  Self Select
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2
                lg:grid-cols-3 gap-3">
                {gs.groups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-lg border p-3 space-y-3"
                  >
                    <p className="text-sm font-semibold">
                      {group.name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.members.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs bg-muted px-2
                            py-0.5 rounded-full"
                        >
                          {m.studentName}
                        </span>
                      ))}
                      {group.members.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Empty
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleJoin(gs.id, group.id)
                      }
                      className="w-full min-h-[44px]"
                    >
                      Join Group
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
