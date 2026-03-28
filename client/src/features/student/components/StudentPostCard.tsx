'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, ClipboardList, HelpCircle,
  BarChart3, CheckCircle2, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { StreamPost } from './types'

const TYPE_ICON: Record<string, typeof FileText> = {
  MATERIAL: FileText,
  ASSIGNMENT: ClipboardList,
  QUIZ: HelpCircle,
  POLL: BarChart3,
  HOMEWORK: BookOpen,
  ANNOUNCEMENT: FileText,
  EXAM: ClipboardList,
}

interface StudentPostCardProps {
  post: StreamPost
  subjectId: string
  studentId: string
}

export function StudentPostCard({
  post,
  subjectId,
  studentId,
}: StudentPostCardProps) {
  const Icon = TYPE_ICON[post.type] ?? FileText
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(
    !!post.assignment?.submission,
  )
  const [hwDone, setHwDone] = useState(
    post.homework?.completion?.isDone ?? false,
  )

  void studentId

  const handleAssignmentSubmit = async () => {
    setSubmitting(true)
    const res = await fetch(
      `/api/student/subjects/${subjectId}/assignments/${post.assignment!.id}/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    )
    if (res.ok) setSubmitted(true)
    setSubmitting(false)
  }

  const handleHomeworkToggle = async () => {
    const next = !hwDone
    setHwDone(next)
    await fetch('/api/student/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeworkId: post.homework!.id, isDone: next }),
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary
          flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5
              rounded-full bg-muted text-muted-foreground">
              {post.type}
            </span>
            {post.topicTag && (
              <span className="text-xs text-muted-foreground">
                {post.topicTag}
              </span>
            )}
          </div>
          <p className="font-semibold mt-1">{post.title}</p>
          {post.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.description}
            </p>
          )}
        </div>
      </div>

      {/* Assignment */}
      {post.assignment && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Due: {new Date(post.assignment.dueDate).toLocaleDateString()}
          </span>
          {submitted ? (
            <span className="inline-flex items-center gap-1 text-sm
              font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Submitted
            </span>
          ) : (
            <Button
              size="sm"
              onClick={handleAssignmentSubmit}
              disabled={submitting}
              className="min-h-[44px]"
            >
              Submit
            </Button>
          )}
        </div>
      )}

      {/* Quiz */}
      {post.quiz && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {post.quiz.questionCount} questions
            {post.quiz.timeLimit ? ` | ${post.quiz.timeLimit} min` : ''}
          </span>
          {post.quiz.attempt?.submittedAt ? (
            <span className="text-sm font-medium text-green-600">
              Score: {post.quiz.attempt.score ?? '---'}/{post.quiz.totalMarks}
            </span>
          ) : (
            <Link
              href={`/consumer/subjects/${subjectId}/quiz/${post.quiz.id}`}
              className="min-h-[44px] inline-flex items-center"
            >
              <Button size="sm">Start Quiz</Button>
            </Link>
          )}
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <div className="pt-2 border-t text-sm">
          <p className="font-medium mb-2">{post.poll.question}</p>
          {post.poll.vote ? (
            <p className="text-green-600 text-xs font-medium">
              Vote recorded
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Tap to vote in stream
            </p>
          )}
        </div>
      )}

      {/* Homework */}
      {post.homework && (
        <div className="flex items-center gap-3 pt-2 border-t">
          <Checkbox
            checked={hwDone}
            onCheckedChange={handleHomeworkToggle}
            className="h-5 w-5"
          />
          <span className={`text-sm ${hwDone ? 'line-through text-muted-foreground' : ''}`}>
            Mark as done
          </span>
        </div>
      )}
    </div>
  )
}
