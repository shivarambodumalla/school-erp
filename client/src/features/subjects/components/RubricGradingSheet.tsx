'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'


// ─── Types ───

interface PerformanceLevel {
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

interface RubricForGrading {
  id: string
  name: string
  criteria: RubricCriterion[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  rubric: RubricForGrading
  studentName: string
  existingScores?: Record<string, number>
  existingComments?: Record<string, string>
  existingFeedback?: string
  onGraded: (result: {
    scores: Record<string, number>
    comments: Record<string, string>
    totalScore: number
    totalMax: number
    feedback: string
  }) => void
}

export function RubricGradingSheet({
  open,
  onOpenChange,
  rubric,
  studentName,
  existingScores,
  existingComments,
  existingFeedback,
  onGraded,
}: Props) {
  // Track selected level index per criterion
  const [selectedLevels, setSelectedLevels] = useState<
    Record<string, number>
  >(() => {
    if (!existingScores) return {}
    const initial: Record<string, number> = {}
    for (const criterion of rubric.criteria) {
      const score = existingScores[criterion.id]
      if (score !== undefined) {
        // Find the level that matches the score
        const levelIdx = criterion.levels.findIndex(
          (l) =>
            Math.round((criterion.maxPoints * l.percentage) / 100) === score
        )
        if (levelIdx >= 0) {
          initial[criterion.id] = levelIdx
        }
      }
    }
    return initial
  })

  const [comments, setComments] = useState<Record<string, string>>(
    existingComments ?? {}
  )
  const [feedback, setFeedback] = useState(existingFeedback ?? '')

  const totalMax = rubric.criteria.reduce(
    (acc, c) => acc + c.maxPoints, 0
  )

  const totalScore = useMemo(() => {
    let sum = 0
    for (const criterion of rubric.criteria) {
      const levelIdx = selectedLevels[criterion.id]
      if (levelIdx !== undefined && criterion.levels[levelIdx]) {
        sum += Math.round(
          (criterion.maxPoints * criterion.levels[levelIdx].percentage) / 100
        )
      }
    }
    return sum
  }, [rubric.criteria, selectedLevels])

  const allCriteriaScored = rubric.criteria.every(
    (c) => selectedLevels[c.id] !== undefined
  )

  const handleSelectLevel = (criterionId: string, levelIdx: number) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [criterionId]: levelIdx,
    }))
  }

  const handleSubmit = () => {
    const scores: Record<string, number> = {}
    for (const criterion of rubric.criteria) {
      const levelIdx = selectedLevels[criterion.id]
      if (levelIdx !== undefined && criterion.levels[levelIdx]) {
        scores[criterion.id] = Math.round(
          (criterion.maxPoints * criterion.levels[levelIdx].percentage) / 100
        )
      }
    }
    onGraded({
      scores,
      comments,
      totalScore,
      totalMax,
      feedback: feedback.trim(),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Rubric Grading</SheetTitle>
          <SheetDescription>
            {rubric.name} &mdash; {studentName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pt-4">
          {/* Score summary */}
          <div className="flex items-center justify-between rounded-lg
            border bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">Total Score</span>
            <span className="text-lg font-bold">
              {totalScore}/{totalMax}
              <span className="text-sm text-muted-foreground ml-1 font-normal">
                ({totalMax > 0
                  ? Math.round((totalScore / totalMax) * 100)
                  : 0}%)
              </span>
            </span>
          </div>

          {/* Criteria scoring */}
          {rubric.criteria.map((criterion) => (
            <CriterionGrading
              key={criterion.id}
              criterion={criterion}
              selectedLevel={selectedLevels[criterion.id]}
              comment={comments[criterion.id] ?? ''}
              onSelectLevel={(idx) =>
                handleSelectLevel(criterion.id, idx)
              }
              onComment={(text) =>
                setComments((prev) => ({
                  ...prev,
                  [criterion.id]: text,
                }))
              }
            />
          ))}

          {/* Overall feedback */}
          <div className="space-y-2 border-t pt-4">
            <Label>Overall Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="General feedback for the student..."
            />
          </div>
        </div>

        <SheetFooter className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!allCriteriaScored}
            className="w-full min-h-[44px]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply Rubric Score ({totalScore}/{totalMax})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── Criterion Grading ───

function CriterionGrading({
  criterion,
  selectedLevel,
  comment,
  onSelectLevel,
  onComment,
}: {
  criterion: RubricCriterion
  selectedLevel: number | undefined
  comment: string
  onSelectLevel: (idx: number) => void
  onComment: (text: string) => void
}) {
  const [showComment, setShowComment] = useState(!!comment)

  return (
    <div className="rounded-lg border p-3 space-y-3">
      {/* Criterion header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{criterion.title}</p>
          {criterion.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {criterion.description}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground
          shrink-0">
          {selectedLevel !== undefined && criterion.levels[selectedLevel]
            ? Math.round(
                (criterion.maxPoints *
                  criterion.levels[selectedLevel].percentage) /
                  100
              )
            : '?'}
          /{criterion.maxPoints}
        </span>
      </div>

      {/* Level radio buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {criterion.levels.map((level, idx) => {
          const points = Math.round(
            (criterion.maxPoints * level.percentage) / 100
          )
          const isSelected = selectedLevel === idx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectLevel(idx)}
              className={`rounded-lg border p-2 text-center
                transition-colors min-h-[44px]
                ${isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'hover:bg-muted/50'
                }`}
            >
              <p className="text-xs font-medium">
                {level.label || `Level ${idx + 1}`}
              </p>
              <p className="text-sm font-bold mt-0.5">
                {points}
              </p>
              <p className="text-xs text-muted-foreground">
                {level.percentage}%
              </p>
            </button>
          )
        })}
      </div>

      {/* Per-criterion comment */}
      {showComment ? (
        <Textarea
          value={comment}
          onChange={(e) => onComment(e.target.value)}
          rows={2}
          placeholder="Comment on this criterion..."
          className="text-sm"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowComment(true)}
          className="text-xs text-primary hover:underline min-h-[28px]"
        >
          + Add comment
        </button>
      )}
    </div>
  )
}
