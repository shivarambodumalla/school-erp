'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PollFields } from './PollFields'
import type { SubjectPostType } from '@prisma/client'

export interface PostFormProps {
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

export function PostFormFields(props: PostFormProps) {
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
          onChange={(e) =>
            props.setTopicTag(e.target.value)
          }
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
            onChange={(e) =>
              props.setDueDate(e.target.value)
            }
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
          <Loader2 className="h-4 w-4 mr-2
            animate-spin" />
        )}
        Create Post
      </Button>
    </div>
  )
}
