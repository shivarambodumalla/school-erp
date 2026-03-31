'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Loader2,
  CheckSquare,
  Square,
  Filter,
  BookOpen,
  ArrowRight,
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
import { Badge } from '@/components/ui/badge'
import type { QuestionType } from '@prisma/client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  onAddToQuiz: (questions: QuestionBankItemData[]) => void
}

interface QuestionBankData {
  id: string
  name: string
  description: string | null
  _count: { items: number }
}

interface QuestionBankItemData {
  id: string
  bankId: string
  type: QuestionType
  text: string
  options: unknown
  correctAnswer: string | null
  marks: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  explanation: string | null
}

type DifficultyFilter = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD'

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

const DIFFICULTY_OPTIONS: {
  value: DifficultyFilter
  label: string
}[] = [
  { value: 'ALL', label: 'All' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

const TYPE_COLORS: Record<string, string> = {
  MCQ: 'bg-blue-100 text-blue-700',
  MULTI_SELECT: 'bg-violet-100 text-violet-700',
  TRUE_FALSE: 'bg-teal-100 text-teal-700',
  SHORT: 'bg-orange-100 text-orange-700',
  LONG: 'bg-rose-100 text-rose-700',
}

export function QuestionBankSheet({
  open,
  onOpenChange,
  subjectId,
  onAddToQuiz,
}: Props) {
  const [banks, setBanks] = useState<QuestionBankData[]>([])
  const [selectedBankId, setSelectedBankId] = useState<
    string | null
  >(null)
  const [questions, setQuestions] = useState<
    QuestionBankItemData[]
  >([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set()
  )
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [loadingQuestions, setLoadingQuestions] =
    useState(false)

  // Create bank form
  const [showCreateBank, setShowCreateBank] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newBankDesc, setNewBankDesc] = useState('')
  const [creatingBank, setCreatingBank] = useState(false)

  // Add question form
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQType, setNewQType] =
    useState<QuestionType>('MCQ')
  const [newQText, setNewQText] = useState('')
  const [newQOptions, setNewQOptions] = useState(['', ''])
  const [newQCorrect, setNewQCorrect] = useState('')
  const [newQMarks, setNewQMarks] = useState('1')
  const [newQDifficulty, setNewQDifficulty] = useState<
    'EASY' | 'MEDIUM' | 'HARD'
  >('MEDIUM')
  const [newQTags, setNewQTags] = useState('')
  const [newQExplanation, setNewQExplanation] = useState('')
  const [addingQuestion, setAddingQuestion] = useState(false)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>('ALL')
  const [typeFilter, setTypeFilter] = useState<
    QuestionType | 'ALL'
  >('ALL')

  const apiBase = `/api/school/subjects/${subjectId}/question-bank`

  const fetchBanks = useCallback(async () => {
    setLoadingBanks(true)
    try {
      const res = await fetch(apiBase)
      if (res.ok) {
        const json = (await res.json()) as {
          banks: QuestionBankData[]
        }
        setBanks(json.banks ?? [])
      }
    } finally {
      setLoadingBanks(false)
    }
  }, [apiBase])

  const fetchQuestions = useCallback(
    async (bankId: string) => {
      setLoadingQuestions(true)
      try {
        const res = await fetch(`${apiBase}/${bankId}`)
        if (res.ok) {
          const json = (await res.json()) as {
            items: QuestionBankItemData[]
          }
          setQuestions(json.items ?? [])
        }
      } finally {
        setLoadingQuestions(false)
      }
    },
    [apiBase]
  )

  useEffect(() => {
    if (open) {
      fetchBanks()
      setSelectedBankId(null)
      setQuestions([])
      setSelectedIds(new Set())
      setShowCreateBank(false)
      setShowAddQuestion(false)
    }
  }, [open, fetchBanks])

  useEffect(() => {
    if (selectedBankId) {
      fetchQuestions(selectedBankId)
      setSelectedIds(new Set())
    }
  }, [selectedBankId, fetchQuestions])

  const handleCreateBank = async () => {
    if (!newBankName.trim()) return
    setCreatingBank(true)
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBankName.trim(),
          description: newBankDesc.trim() || null,
        }),
      })
      if (res.ok) {
        toast.success('Question bank created')
        setNewBankName('')
        setNewBankDesc('')
        setShowCreateBank(false)
        fetchBanks()
      } else {
        toast.error('Failed to create bank')
      }
    } finally {
      setCreatingBank(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQText.trim() || !selectedBankId) return
    setAddingQuestion(true)
    try {
      const showOptions =
        newQType === 'MCQ' ||
        newQType === 'MULTI_SELECT' ||
        newQType === 'TRUE_FALSE'
      const payload = {
        type: newQType,
        text: newQText.trim(),
        options: showOptions
          ? newQOptions.filter((o) => o.trim() !== '')
          : [],
        correctAnswer: newQCorrect || null,
        marks: Number(newQMarks) || 1,
        difficulty: newQDifficulty,
        tags: newQTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        explanation: newQExplanation.trim() || null,
      }
      const res = await fetch(
        `${apiBase}/${selectedBankId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (res.ok) {
        toast.success('Question added')
        resetAddForm()
        fetchQuestions(selectedBankId)
      } else {
        toast.error('Failed to add question')
      }
    } finally {
      setAddingQuestion(false)
    }
  }

  const resetAddForm = () => {
    setShowAddQuestion(false)
    setNewQType('MCQ')
    setNewQText('')
    setNewQOptions(['', ''])
    setNewQCorrect('')
    setNewQMarks('1')
    setNewQDifficulty('MEDIUM')
    setNewQTags('')
    setNewQExplanation('')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddToQuiz = () => {
    const selected = questions.filter((q) =>
      selectedIds.has(q.id)
    )
    onAddToQuiz(selected)
    onOpenChange(false)
  }

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (
      difficultyFilter !== 'ALL' &&
      q.difficulty !== difficultyFilter
    )
      return false
    if (typeFilter !== 'ALL' && q.type !== typeFilter)
      return false
    if (
      searchText &&
      !q.text
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )
      return false
    return true
  })

  const showOptions =
    newQType === 'MCQ' ||
    newQType === 'MULTI_SELECT' ||
    newQType === 'TRUE_FALSE'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-4xl p-0
          flex flex-col"
      >
        <div className="p-6 pb-0">
          <SheetHeader>
            <SheetTitle>Question Bank</SheetTitle>
            <SheetDescription>
              Select questions to add to your quiz
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden flex
          flex-col sm:flex-row">
          {/* LEFT: Banks list */}
          <div className="w-full sm:w-64 border-b sm:border-b-0
            sm:border-r overflow-y-auto p-4 space-y-2
            shrink-0">
            <div className="flex items-center justify-between
              mb-2">
              <p className="text-xs font-medium
                text-muted-foreground uppercase
                tracking-wider">
                Banks
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setShowCreateBank(!showCreateBank)
                }
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Create bank inline form */}
            {showCreateBank && (
              <div className="space-y-2 p-3 rounded-lg
                border bg-muted/30">
                <Input
                  value={newBankName}
                  onChange={(e) =>
                    setNewBankName(e.target.value)
                  }
                  placeholder="Bank name"
                  className="min-h-[44px] text-sm"
                />
                <Input
                  value={newBankDesc}
                  onChange={(e) =>
                    setNewBankDesc(e.target.value)
                  }
                  placeholder="Description (optional)"
                  className="min-h-[44px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateBank}
                    disabled={
                      creatingBank ||
                      !newBankName.trim()
                    }
                    className="min-h-[36px] flex-1"
                  >
                    {creatingBank && (
                      <Loader2 className="h-3 w-3 mr-1
                        animate-spin" />
                    )}
                    Create
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateBank(false)
                      setNewBankName('')
                      setNewBankDesc('')
                    }}
                    className="min-h-[36px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {loadingBanks ? (
              <div className="flex items-center justify-center
                py-8">
                <Loader2 className="h-4 w-4 animate-spin
                  text-muted-foreground" />
              </div>
            ) : banks.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <BookOpen className="h-8 w-8 mx-auto
                  text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No question banks yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateBank(true)}
                  className="min-h-[36px]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Bank
                </Button>
              </div>
            ) : (
              banks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() =>
                    setSelectedBankId(bank.id)
                  }
                  className={`w-full text-left p-3
                    rounded-lg transition-colors
                    min-h-[44px]
                    ${
                      selectedBankId === bank.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-accent border border-transparent'
                    }`}
                >
                  <p className="text-sm font-medium
                    truncate">
                    {bank.name}
                  </p>
                  <p className="text-xs
                    text-muted-foreground mt-0.5">
                    {bank._count.items} question
                    {bank._count.items !== 1 ? 's' : ''}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* RIGHT: Questions in selected bank */}
          <div className="flex-1 overflow-y-auto p-4
            space-y-3">
            {!selectedBankId ? (
              <div className="flex flex-col items-center
                justify-center h-full gap-3
                text-muted-foreground">
                <ArrowRight className="h-8 w-8
                  hidden sm:block" />
                <p className="text-sm">
                  Select a bank to view questions
                </p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col gap-2
                  sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3
                      top-1/2 -translate-y-1/2 h-4 w-4
                      text-muted-foreground" />
                    <Input
                      value={searchText}
                      onChange={(e) =>
                        setSearchText(e.target.value)
                      }
                      placeholder="Search questions..."
                      className="pl-9 min-h-[44px]
                        w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2
                    flex-wrap">
                    <Filter className="h-4 w-4
                      text-muted-foreground shrink-0" />
                    <select
                      value={difficultyFilter}
                      onChange={(e) =>
                        setDifficultyFilter(
                          e.target.value as DifficultyFilter
                        )
                      }
                      className="h-9 rounded-md border
                        border-input bg-transparent px-2
                        text-sm min-h-[36px]"
                    >
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={typeFilter}
                      onChange={(e) =>
                        setTypeFilter(
                          e.target
                            .value as QuestionType | 'ALL'
                        )
                      }
                      className="h-9 rounded-md border
                        border-input bg-transparent px-2
                        text-sm min-h-[36px]"
                    >
                      <option value="ALL">All Types</option>
                      {QUESTION_TYPES.map((qt) => (
                        <option
                          key={qt.value}
                          value={qt.value}
                        >
                          {qt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add question button / form */}
                {!showAddQuestion ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddQuestion(true)}
                    className="min-h-[44px]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                ) : (
                  <div className="rounded-lg border p-4
                    bg-muted/20 space-y-3">
                    <div className="flex items-center
                      justify-between">
                      <p className="text-sm font-medium">
                        New Question
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetAddForm}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Type */}
                    <div className="flex flex-wrap gap-1.5">
                      {QUESTION_TYPES.map((qt) => (
                        <button
                          key={qt.value}
                          type="button"
                          onClick={() => {
                            setNewQType(qt.value)
                            if (
                              qt.value === 'TRUE_FALSE'
                            ) {
                              setNewQOptions([
                                'True',
                                'False',
                              ])
                            }
                          }}
                          className={`px-3 py-1.5
                            rounded-full text-xs
                            font-medium min-h-[32px]
                            ${
                              newQType === qt.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {qt.label}
                        </button>
                      ))}
                    </div>

                    {/* Text */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Question Text
                      </Label>
                      <Textarea
                        value={newQText}
                        onChange={(e) =>
                          setNewQText(e.target.value)
                        }
                        rows={2}
                        placeholder="Enter question text"
                      />
                    </div>

                    {/* Options for MCQ types */}
                    {showOptions && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Options
                        </Label>
                        {newQOptions.map((opt, i) => (
                          <div
                            key={i}
                            className="flex items-center
                              gap-2"
                          >
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const next = [
                                  ...newQOptions,
                                ]
                                next[i] = e.target.value
                                setNewQOptions(next)
                              }}
                              placeholder={`Option ${i + 1}`}
                              className="min-h-[44px]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setNewQCorrect(opt)
                              }
                              className={`shrink-0 h-5
                                w-5 rounded-full
                                border-2
                                ${
                                  newQCorrect === opt &&
                                  opt !== ''
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-muted-foreground'
                                }`}
                              title="Mark as correct"
                            />
                          </div>
                        ))}
                        {newQType !== 'TRUE_FALSE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setNewQOptions((p) => [
                                ...p,
                                '',
                              ])
                            }
                            className="min-h-[36px]"
                          >
                            <Plus className="h-3 w-3
                              mr-1" />
                            Add Option
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Marks, Difficulty, Tags row */}
                    <div className="grid grid-cols-1
                      sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Marks
                        </Label>
                        <Input
                          type="number"
                          value={newQMarks}
                          onChange={(e) =>
                            setNewQMarks(e.target.value)
                          }
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Difficulty
                        </Label>
                        <select
                          value={newQDifficulty}
                          onChange={(e) =>
                            setNewQDifficulty(
                              e.target.value as
                                | 'EASY'
                                | 'MEDIUM'
                                | 'HARD'
                            )
                          }
                          className="flex h-11 w-full
                            rounded-md border border-input
                            bg-transparent px-3 py-2
                            text-sm"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">
                            Medium
                          </option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Tags
                        </Label>
                        <Input
                          value={newQTags}
                          onChange={(e) =>
                            setNewQTags(e.target.value)
                          }
                          placeholder="tag1, tag2"
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Explanation (optional)
                      </Label>
                      <Textarea
                        value={newQExplanation}
                        onChange={(e) =>
                          setNewQExplanation(
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                    <Button
                      onClick={handleAddQuestion}
                      disabled={
                        addingQuestion ||
                        !newQText.trim()
                      }
                      className="w-full min-h-[44px]"
                    >
                      {addingQuestion && (
                        <Loader2 className="h-4 w-4 mr-2
                          animate-spin" />
                      )}
                      Add Question
                    </Button>
                  </div>
                )}

                {/* Questions list */}
                {loadingQuestions ? (
                  <div className="flex items-center
                    justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin
                      text-muted-foreground" />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="text-center py-12
                    text-muted-foreground">
                    <p className="text-sm">
                      {questions.length === 0
                        ? 'No questions in this bank yet'
                        : 'No questions match your filters'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredQuestions.map((q) => {
                      const isSelected = selectedIds.has(
                        q.id
                      )
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() =>
                            toggleSelect(q.id)
                          }
                          className={`w-full text-left p-3
                            rounded-lg border
                            transition-colors
                            min-h-[44px]
                            ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30'
                            }`}
                        >
                          <div className="flex items-start
                            gap-3">
                            <div className="mt-0.5
                              shrink-0">
                              {isSelected ? (
                                <CheckSquare className="h-5
                                  w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5
                                  text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1
                              min-w-0 space-y-1.5">
                              <div className="flex
                                items-center gap-1.5
                                flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs
                                    ${TYPE_COLORS[q.type] ?? ''}`}
                                >
                                  {q.type}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs
                                    ${DIFFICULTY_COLORS[q.difficulty] ?? ''}`}
                                >
                                  {q.difficulty}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {q.marks} mark
                                  {q.marks !== 1
                                    ? 's'
                                    : ''}
                                </Badge>
                              </div>
                              <p className="text-sm
                                line-clamp-2">
                                {q.text}
                              </p>
                              {q.tags.length > 0 && (
                                <div className="flex
                                  gap-1 flex-wrap">
                                  {q.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs
                                        text-muted-foreground
                                        bg-muted px-1.5
                                        py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        {selectedIds.size > 0 && (
          <div className="border-t p-4 bg-background shrink-0">
            <Button
              onClick={handleAddToQuiz}
              className="w-full min-h-[44px]"
            >
              Add Selected ({selectedIds.size}) to Quiz
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
