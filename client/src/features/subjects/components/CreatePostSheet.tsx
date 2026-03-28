'use client'

import { useState } from 'react'
import {
  FileText,
  ClipboardList,
  HelpCircle,
  BarChart3,
  BookOpen,
  Megaphone,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { SubjectPostType } from '@prisma/client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  onCreated: () => void
}

const TYPE_OPTIONS: {
  type: SubjectPostType
  label: string
  icon: typeof FileText
  color: string
}[] = [
  {
    type: 'MATERIAL',
    label: 'Material',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    type: 'ASSIGNMENT',
    label: 'Assignment',
    icon: ClipboardList,
    color: 'text-violet-600 bg-violet-50',
  },
  {
    type: 'QUIZ',
    label: 'Quiz',
    icon: HelpCircle,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    type: 'POLL',
    label: 'Poll',
    icon: BarChart3,
    color: 'text-teal-600 bg-teal-50',
  },
  {
    type: 'HOMEWORK',
    label: 'Homework',
    icon: BookOpen,
    color: 'text-orange-600 bg-orange-50',
  },
  {
    type: 'ANNOUNCEMENT',
    label: 'Announcement',
    icon: Megaphone,
    color: 'text-green-600 bg-green-50',
  },
]

export function CreatePostSheet({
  open,
  onOpenChange,
  subjectId,
  onCreated,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [postType, setPostType] =
    useState<SubjectPostType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [topicTag, setTopicTag] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [totalMarks, setTotalMarks] = useState('100')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState([
    '',
    '',
  ])
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setStep(1)
    setPostType(null)
    setTitle('')
    setDescription('')
    setTopicTag('')
    setDueDate('')
    setTotalMarks('100')
    setPollQuestion('')
    setPollOptions(['', ''])
    setSaving(false)
  }

  const handleClose = (val: boolean) => {
    if (!val) reset()
    onOpenChange(val)
  }

  const selectType = (t: SubjectPostType) => {
    setPostType(t)
    setStep(2)
  }

  const addPollOption = () => {
    setPollOptions((prev) => [...prev, ''])
  }

  const updatePollOption = (i: number, val: string) => {
    setPollOptions((prev) =>
      prev.map((o, idx) => (idx === i ? val : o))
    )
  }

  const handleSubmit = async () => {
    if (!postType || !title.trim()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        type: postType,
        title: title.trim(),
        description: description.trim() || undefined,
        topicTag: topicTag.trim() || undefined,
      }
      if (
        postType === 'ASSIGNMENT' ||
        postType === 'HOMEWORK'
      ) {
        payload.dueDate = dueDate
      }
      if (postType === 'ASSIGNMENT') {
        payload.totalMarks = Number(totalMarks) || 100
      }
      if (postType === 'POLL') {
        payload.question = pollQuestion.trim() || title
        payload.options = pollOptions.filter(
          (o) => o.trim() !== ''
        )
      }
      const res = await fetch(
        `/api/school/subjects/${subjectId}/posts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (res.ok) {
        reset()
        onCreated()
      }
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
          <SheetTitle>
            {step === 1
              ? 'Create Post'
              : `New ${postType}`}
          </SheetTitle>
          <SheetDescription>
            {step === 1
              ? 'Select a content type'
              : 'Fill in post details'}
          </SheetDescription>
        </SheetHeader>

        {step === 1 ? (
          <TypeSelector onSelect={selectType} />
        ) : (
          <PostForm
            postType={postType!}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            topicTag={topicTag}
            setTopicTag={setTopicTag}
            dueDate={dueDate}
            setDueDate={setDueDate}
            totalMarks={totalMarks}
            setTotalMarks={setTotalMarks}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            addPollOption={addPollOption}
            updatePollOption={updatePollOption}
            saving={saving}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function TypeSelector({
  onSelect,
}: {
  onSelect: (t: SubjectPostType) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-4">
      {TYPE_OPTIONS.map((opt) => {
        const Icon = opt.icon
        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelect(opt.type)}
            className={`flex flex-col items-center gap-2
              p-4 rounded-xl border transition-colors
              hover:border-primary min-h-[80px]`}
          >
            <div
              className={`h-10 w-10 rounded-lg flex
                items-center justify-center ${opt.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface FormProps {
  postType: SubjectPostType
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  topicTag: string
  setTopicTag: (v: string) => void
  dueDate: string
  setDueDate: (v: string) => void
  totalMarks: string
  setTotalMarks: (v: string) => void
  pollQuestion: string
  setPollQuestion: (v: string) => void
  pollOptions: string[]
  addPollOption: () => void
  updatePollOption: (i: number, v: string) => void
  saving: boolean
  onSubmit: () => void
  onBack: () => void
}

function PostForm(props: FormProps) {
  const needsDue =
    props.postType === 'ASSIGNMENT' ||
    props.postType === 'HOMEWORK'

  return (
    <div className="space-y-4 pt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={props.onBack}
        className="min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={props.title}
          onChange={(e) => props.setTitle(e.target.value)}
          placeholder="Post title"
          className="min-h-[44px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={props.description}
          onChange={(e) =>
            props.setDescription(e.target.value)
          }
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic Tag</Label>
        <Input
          id="topic"
          value={props.topicTag}
          onChange={(e) => props.setTopicTag(e.target.value)}
          placeholder="e.g. Chapter 1"
          className="min-h-[44px]"
        />
      </div>

      {needsDue && (
        <div className="space-y-2">
          <Label htmlFor="due">Due Date</Label>
          <Input
            id="due"
            type="datetime-local"
            value={props.dueDate}
            onChange={(e) => props.setDueDate(e.target.value)}
            className="min-h-[44px]"
          />
        </div>
      )}

      {props.postType === 'ASSIGNMENT' && (
        <div className="space-y-2">
          <Label htmlFor="marks">Total Marks</Label>
          <Input
            id="marks"
            type="number"
            value={props.totalMarks}
            onChange={(e) =>
              props.setTotalMarks(e.target.value)
            }
            className="min-h-[44px]"
          />
        </div>
      )}

      {props.postType === 'POLL' && (
        <PollFields
          question={props.pollQuestion}
          setQuestion={props.setPollQuestion}
          options={props.pollOptions}
          addOption={props.addPollOption}
          updateOption={props.updatePollOption}
        />
      )}

      <Button
        onClick={props.onSubmit}
        disabled={props.saving || !props.title.trim()}
        className="w-full min-h-[44px]"
      >
        {props.saving && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        Create Post
      </Button>
    </div>
  )
}

function PollFields({
  question,
  setQuestion,
  options,
  addOption,
  updateOption,
}: {
  question: string
  setQuestion: (v: string) => void
  options: string[]
  addOption: () => void
  updateOption: (i: number, v: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Poll Question</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="min-h-[44px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((opt, i) => (
          <Input
            key={i}
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="min-h-[44px]"
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="min-h-[44px]"
        >
          Add Option
        </Button>
      </div>
    </div>
  )
}
