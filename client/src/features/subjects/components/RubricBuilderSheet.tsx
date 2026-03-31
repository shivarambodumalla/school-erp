'use client'

import { useState } from 'react'
import {
  Loader2,
  Plus,
  Trash2,
  Eye,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

// ─── Types ───

interface PerformanceLevel {
  id: string
  label: string
  percentage: number
}

interface RubricCriterion {
  id: string
  title: string
  description: string
  maxPoints: number
  levels: PerformanceLevel[]
}

interface RubricData {
  id?: string
  name: string
  description: string
  criteria: RubricCriterion[]
  shareWithInstitution: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  existingRubric?: RubricData | null
  onSaved: (rubric: RubricData) => void
}

const DEFAULT_LEVELS: PerformanceLevel[] = [
  { id: 'lv-1', label: 'Excellent', percentage: 100 },
  { id: 'lv-2', label: 'Good', percentage: 75 },
  { id: 'lv-3', label: 'Satisfactory', percentage: 50 },
  { id: 'lv-4', label: 'Needs Work', percentage: 25 },
]

let nextId = 0
function generateId(): string {
  nextId += 1
  return `tmp-${nextId}-${Date.now()}`
}

function createDefaultCriterion(): RubricCriterion {
  return {
    id: generateId(),
    title: '',
    description: '',
    maxPoints: 10,
    levels: DEFAULT_LEVELS.map((l) => ({ ...l, id: generateId() })),
  }
}

export function RubricBuilderSheet({
  open,
  onOpenChange,
  subjectId,
  existingRubric,
  onSaved,
}: Props) {
  const [name, setName] = useState(existingRubric?.name ?? '')
  const [description, setDescription] = useState(
    existingRubric?.description ?? ''
  )
  const [criteria, setCriteria] = useState<RubricCriterion[]>(
    existingRubric?.criteria ?? [createDefaultCriterion()]
  )
  const [shareWithInstitution, setShareWithInstitution] = useState(
    existingRubric?.shareWithInstitution ?? false
  )
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const totalPoints = criteria.reduce((acc, c) => acc + c.maxPoints, 0)

  // ─── Criterion CRUD ───

  const addCriterion = () => {
    setCriteria((prev) => [...prev, createDefaultCriterion()])
  }

  const removeCriterion = (id: string) => {
    if (criteria.length <= 1) return
    setCriteria((prev) => prev.filter((c) => c.id !== id))
  }

  const updateCriterion = (
    id: string,
    field: keyof RubricCriterion,
    value: string | number
  ) => {
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    )
  }

  // ─── Level CRUD ───

  const addLevel = (criterionId: string) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== criterionId) return c
        return {
          ...c,
          levels: [
            ...c.levels,
            { id: generateId(), label: '', percentage: 0 },
          ],
        }
      })
    )
  }

  const removeLevel = (criterionId: string, levelId: string) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== criterionId) return c
        if (c.levels.length <= 1) return c
        return {
          ...c,
          levels: c.levels.filter((l) => l.id !== levelId),
        }
      })
    )
  }

  const updateLevel = (
    criterionId: string,
    levelId: string,
    field: 'label' | 'percentage',
    value: string | number
  ) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== criterionId) return c
        return {
          ...c,
          levels: c.levels.map((l) =>
            l.id === levelId ? { ...l, [field]: value } : l
          ),
        }
      })
    )
  }

  // ─── Save ───

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Rubric name is required')
      return
    }
    if (criteria.some((c) => !c.title.trim())) {
      toast.error('All criteria must have a title')
      return
    }

    setSaving(true)
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        criteria: criteria.map((c) => ({
          title: c.title,
          description: c.description,
          maxPoints: c.maxPoints,
          levels: c.levels.map((l) => ({
            label: l.label,
            percentage: l.percentage,
          })),
        })),
        shareWithInstitution,
      }
      const method = existingRubric?.id ? 'PUT' : 'POST'
      const url = existingRubric?.id
        ? `/api/school/subjects/${subjectId}/rubrics/${existingRubric.id}`
        : `/api/school/subjects/${subjectId}/rubrics`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const saved = (await res.json()) as RubricData
        toast.success('Rubric saved')
        onSaved(saved)
      } else {
        toast.error('Failed to save rubric')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {existingRubric?.id ? 'Edit Rubric' : 'Create Rubric'}
          </SheetTitle>
          <SheetDescription>
            Define scoring criteria and performance levels.
          </SheetDescription>
        </SheetHeader>

        {previewMode ? (
          <RubricPreview
            name={name}
            description={description}
            criteria={criteria}
            onExitPreview={() => setPreviewMode(false)}
          />
        ) : (
          <div className="space-y-6 pt-4">
            {/* Name & description */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Rubric Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Essay Rubric"
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Criteria ({criteria.length})
                </Label>
                <span className="text-xs text-muted-foreground">
                  Total: {totalPoints} pts
                </span>
              </div>

              {criteria.map((criterion, idx) => (
                <CriterionEditor
                  key={criterion.id}
                  criterion={criterion}
                  index={idx}
                  canRemove={criteria.length > 1}
                  onUpdate={(field, value) =>
                    updateCriterion(criterion.id, field, value)
                  }
                  onRemove={() => removeCriterion(criterion.id)}
                  onAddLevel={() => addLevel(criterion.id)}
                  onRemoveLevel={(levelId) =>
                    removeLevel(criterion.id, levelId)
                  }
                  onUpdateLevel={(levelId, field, value) =>
                    updateLevel(criterion.id, levelId, field, value)
                  }
                />
              ))}

              <Button
                variant="outline"
                onClick={addCriterion}
                className="w-full min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
              </Button>
            </div>

            {/* Share toggle */}
            <div className="flex items-center justify-between pt-2
              border-t">
              <div>
                <p className="text-sm font-medium">
                  Share with institution
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Other teachers can reuse this rubric
                </p>
              </div>
              <Switch
                checked={shareWithInstitution}
                onCheckedChange={setShareWithInstitution}
              />
            </div>
          </div>
        )}

        <SheetFooter className="pt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="min-h-[44px]"
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          {!previewMode && (
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 min-h-[44px]"
            >
              {saving && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Rubric
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── Criterion Editor ───

function CriterionEditor({
  criterion,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onAddLevel,
  onRemoveLevel,
  onUpdateLevel,
}: {
  criterion: RubricCriterion
  index: number
  canRemove: boolean
  onUpdate: (field: keyof RubricCriterion, value: string | number) => void
  onRemove: () => void
  onAddLevel: () => void
  onRemoveLevel: (levelId: string) => void
  onUpdateLevel: (
    levelId: string,
    field: 'label' | 'percentage',
    value: string | number
  ) => void
}) {
  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground
          mt-3 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={criterion.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder={`Criterion ${index + 1}`}
              className="flex-1 min-h-[44px]"
            />
            <Input
              type="number"
              value={criterion.maxPoints}
              onChange={(e) =>
                onUpdate('maxPoints', Math.max(1, Number(e.target.value)))
              }
              className="w-20 min-h-[44px] text-center"
              min={1}
            />
            <span className="text-sm text-muted-foreground self-center
              shrink-0">
              pts
            </span>
          </div>
          <Textarea
            value={criterion.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={1}
            placeholder="Description (optional)"
            className="text-sm"
          />
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="min-h-[44px] min-w-[44px] text-muted-foreground
              hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Performance levels */}
      <div className="pl-6 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">
          Performance Levels
        </p>
        {criterion.levels.map((level) => (
          <div
            key={level.id}
            className="flex items-center gap-2"
          >
            <Input
              value={level.label}
              onChange={(e) =>
                onUpdateLevel(level.id, 'label', e.target.value)
              }
              placeholder="Level name"
              className="flex-1 min-h-[36px] text-sm"
            />
            <Input
              type="number"
              value={level.percentage}
              onChange={(e) =>
                onUpdateLevel(
                  level.id,
                  'percentage',
                  Math.max(0, Math.min(100, Number(e.target.value)))
                )
              }
              className="w-16 min-h-[36px] text-sm text-center"
              min={0}
              max={100}
            />
            <span className="text-xs text-muted-foreground shrink-0">
              %
            </span>
            <button
              type="button"
              onClick={() => onRemoveLevel(level.id)}
              className="text-muted-foreground hover:text-red-600
                min-h-[28px] min-w-[28px] flex items-center
                justify-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddLevel}
          className="text-xs text-primary hover:underline min-h-[28px]"
        >
          + Add level
        </button>
      </div>
    </div>
  )
}

// ─── Rubric Preview ───

function RubricPreview({
  name,
  description,
  criteria,
  onExitPreview,
}: {
  name: string
  description: string
  criteria: RubricCriterion[]
  onExitPreview: () => void
}) {
  const totalPoints = criteria.reduce((acc, c) => acc + c.maxPoints, 0)

  return (
    <div className="space-y-4 pt-4">
      <div className="bg-muted/30 rounded-lg p-3 text-xs
        text-muted-foreground text-center">
        Student preview mode
      </div>

      <div>
        <h3 className="text-lg font-semibold">{name || 'Untitled Rubric'}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Total: {totalPoints} points
        </p>
      </div>

      <div className="rounded-xl border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-left px-3 py-2 font-medium
                min-w-[120px]">
                Criterion
              </th>
              {criteria[0]?.levels.map((l) => (
                <th
                  key={l.id}
                  className="text-center px-2 py-2 font-medium
                    min-w-[80px]"
                >
                  {l.label || 'Level'}
                  <div className="text-xs font-normal
                    text-muted-foreground">
                    {l.percentage}%
                  </div>
                </th>
              ))}
              <th className="text-center px-2 py-2 font-medium
                min-w-[60px]">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium">{c.title || 'Untitled'}</p>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.description}
                    </p>
                  )}
                </td>
                {c.levels.map((l) => (
                  <td
                    key={l.id}
                    className="px-2 py-2 text-center text-sm
                      text-muted-foreground"
                  >
                    {Math.round((c.maxPoints * l.percentage) / 100)}
                  </td>
                ))}
                <td className="px-2 py-2 text-center font-medium">
                  {c.maxPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
