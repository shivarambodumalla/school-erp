'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/sheet'
import type {
  QuizWithQuestions,
  QuizQuestionData,
} from '../types'
import type { QuestionType } from '@prisma/client'

interface Props {
  subjectId: string
  postId: string
  postTitle: string
  quiz: QuizWithQuestions
}

export function QuizBuilderClient({
  subjectId,
  postId,
  postTitle,
  quiz: initialQuiz,
}: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState(
    initialQuiz.questions
  )
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    shuffleQuestions: initialQuiz.shuffleQuestions,
    showResultsAfter: initialQuiz.showResultsAfter,
    timeLimit: initialQuiz.timeLimit,
    attemptsAllowed: initialQuiz.attemptsAllowed,
  })

  const apiBase = `/api/school/subjects/${subjectId}/posts/${postId}/quiz`

  const saveSettings = useCallback(async () => {
    await fetch(apiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
  }, [apiBase, settings])

  const addQuestion = async (
    data: Omit<QuizQuestionData, 'id' | 'quizId' | 'order'>
  ) => {
    setSaving(true)
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const q = (await res.json()) as QuizQuestionData
        setQuestions((prev) => [...prev, q])
        setShowAdd(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    const res = await fetch(
      `${apiBase}/${questionId}`,
      { method: 'DELETE' }
    )
    if (res.ok) {
      setQuestions((prev) =>
        prev.filter((q) => q.id !== questionId)
      )
    }
  }

  return (
    <div className="space-y-4">
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
          <h1 className="text-xl font-bold">
            Quiz Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            {postTitle}
          </p>
        </div>
      </div>

      {/* Settings bar */}
      <SettingsBar
        settings={settings}
        onChange={(s) => {
          setSettings(s)
        }}
        onSave={saveSettings}
      />

      {/* Questions list */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="rounded-xl border bg-card p-12
            text-center">
            <p className="text-muted-foreground">
              No questions yet. Add your first question.
            </p>
          </div>
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              onDelete={() => deleteQuestion(q.id)}
            />
          ))
        )}
      </div>

      <Button
        onClick={() => setShowAdd(true)}
        className="min-h-[44px]"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Question
      </Button>

      <AddQuestionSheet
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={addQuestion}
        saving={saving}
      />
    </div>
  )
}

function SettingsBar({
  settings,
  onChange,
  onSave,
}: {
  settings: {
    shuffleQuestions: boolean
    showResultsAfter: boolean
    timeLimit: number | null
    attemptsAllowed: number
  }
  onChange: (s: typeof settings) => void
  onSave: () => void
}) {
  return (
    <div className="rounded-xl border bg-card p-4
      flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Shuffle</Label>
        <Switch
          checked={settings.shuffleQuestions}
          onCheckedChange={(v) =>
            onChange({ ...settings, shuffleQuestions: v })
          }
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs">Show Results</Label>
        <Switch
          checked={settings.showResultsAfter}
          onCheckedChange={(v) =>
            onChange({
              ...settings,
              showResultsAfter: v,
            })
          }
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs">Time (min)</Label>
        <Input
          type="number"
          value={settings.timeLimit ?? ''}
          onChange={(e) =>
            onChange({
              ...settings,
              timeLimit: e.target.value
                ? Number(e.target.value)
                : null,
            })
          }
          className="w-20 h-8"
          placeholder="--"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs">Attempts</Label>
        <Input
          type="number"
          value={settings.attemptsAllowed}
          onChange={(e) =>
            onChange({
              ...settings,
              attemptsAllowed: Number(e.target.value) || 1,
            })
          }
          className="w-16 h-8"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        className="min-h-[36px]"
      >
        Save Settings
      </Button>
    </div>
  )
}

function QuestionCard({
  question,
  index,
  onDelete,
}: {
  question: QuizQuestionData
  index: number
  onDelete: () => void
}) {
  const options = Array.isArray(question.options)
    ? (question.options as string[])
    : []

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between
        gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold
            text-muted-foreground">
            Q{index + 1}
          </span>
          <Badge variant="secondary" className="text-xs">
            {question.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {question.marks} mark{question.marks !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm mt-2">{question.text}</p>
      {options.length > 0 && (
        <div className="mt-2 space-y-1">
          {options.map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-2
                text-sm text-muted-foreground"
            >
              {question.correctAnswer === opt ? (
                <CheckCircle2 className="h-3.5 w-3.5
                  text-green-600" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full
                  border inline-block shrink-0" />
              )}
              {opt}
            </div>
          ))}
        </div>
      )}
      {question.explanation && (
        <p className="text-xs text-muted-foreground mt-2
          italic">
          {question.explanation}
        </p>
      )}
    </div>
  )
}

const QUESTION_TYPES: {
  value: QuestionType
  label: string
}[] = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'MULTI_SELECT', label: 'Multi Select' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'SHORT', label: 'Short Answer' },
  { value: 'LONG', label: 'Long Answer' },
]

function AddQuestionSheet({
  open,
  onOpenChange,
  onAdd,
  saving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (
    data: Omit<QuizQuestionData, 'id' | 'quizId' | 'order'>
  ) => void
  saving: boolean
}) {
  const [type, setType] = useState<QuestionType>('MCQ')
  const [text, setText] = useState('')
  const [marks, setMarks] = useState('1')
  const [explanation, setExplanation] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [correct, setCorrect] = useState('')

  const reset = () => {
    setType('MCQ')
    setText('')
    setMarks('1')
    setExplanation('')
    setOptions(['', ''])
    setCorrect('')
  }

  const handleSubmit = () => {
    if (!text.trim()) return
    const filteredOpts = options.filter(
      (o) => o.trim() !== ''
    )
    onAdd({
      type,
      text: text.trim(),
      options:
        type === 'MCQ' ||
        type === 'MULTI_SELECT' ||
        type === 'TRUE_FALSE'
          ? filteredOpts
          : [],
      correctAnswer: correct || null,
      marks: Number(marks) || 1,
      explanation: explanation.trim() || null,
    })
    reset()
  }

  const showOptions =
    type === 'MCQ' ||
    type === 'MULTI_SELECT' ||
    type === 'TRUE_FALSE'

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Add Question</SheetTitle>
          <SheetDescription>
            Configure your question
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((qt) => (
              <button
                key={qt.value}
                type="button"
                onClick={() => {
                  setType(qt.value)
                  if (qt.value === 'TRUE_FALSE') {
                    setOptions(['True', 'False'])
                  }
                }}
                className={`px-3 py-1.5 rounded-full
                  text-xs font-medium min-h-[36px]
                  ${
                    type === qt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
              >
                {qt.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Marks</Label>
            <Input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          {showOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options]
                      next[i] = e.target.value
                      setOptions(next)
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setCorrect(opt)}
                    className={`shrink-0 h-5 w-5
                      rounded-full border-2
                      ${
                        correct === opt
                          ? 'bg-green-500 border-green-500'
                          : 'border-muted-foreground'
                      }`}
                    title="Mark as correct"
                  />
                </div>
              ))}
              {type !== 'TRUE_FALSE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOptions((prev) => [...prev, ''])
                  }
                  className="min-h-[44px]"
                >
                  Add Option
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Explanation (optional)</Label>
            <Textarea
              value={explanation}
              onChange={(e) =>
                setExplanation(e.target.value)
              }
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving || !text.trim()}
            className="w-full min-h-[44px]"
          >
            {saving && (
              <Loader2 className="h-4 w-4 mr-2
                animate-spin" />
            )}
            Add Question
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
