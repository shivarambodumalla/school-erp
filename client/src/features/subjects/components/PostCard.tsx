'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreVertical,
  Trash2,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  POST_TYPE_COLORS,
  POST_TYPE_BG,
} from '../types'
import type { SubjectPostData } from '../types'

interface Props {
  post: SubjectPostData
  subjectId: string
  onDeleted: (postId: string) => void
}

export function PostCard({ post, subjectId, onDeleted }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const colorClass =
    POST_TYPE_COLORS[post.type] ?? 'border-l-gray-400'
  const badgeClass =
    POST_TYPE_BG[post.type] ?? 'bg-gray-100 text-gray-700'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/posts/${post.id}`,
        { method: 'DELETE' }
      )
      if (res.ok) onDeleted(post.id)
    } finally {
      setDeleting(false)
      setMenuOpen(false)
    }
  }

  const handleView = () => {
    if (post.type === 'QUIZ' && post.quiz) {
      router.push(
        `/management/subjects/${subjectId}/posts/${post.id}/quiz`
      )
    } else if (
      post.type === 'ASSIGNMENT' &&
      post.assignment
    ) {
      router.push(
        `/management/subjects/${subjectId}/posts/${post.id}/submissions`
      )
    }
  }

  const dueDate = post.assignment?.dueDate
  const submissionCount =
    post.assignment?._count?.submissions ?? 0
  const attemptCount =
    post.quiz?._count?.attempts ?? 0
  const voteCount = post.poll?._count?.votes ?? 0

  return (
    <div
      className={`rounded-xl border bg-card border-l-4
        ${colorClass} overflow-hidden`}
    >
      <div className="p-4">
        {/* Top: badge + actions */}
        <div className="flex items-start justify-between
          gap-2">
          <div className="flex items-center gap-2
            flex-wrap">
            <span
              className={`inline-flex items-center px-2
                py-0.5 rounded-full text-xs font-medium
                ${badgeClass}`}
            >
              {post.type}
            </span>
            {post.topicTag && (
              <Badge variant="outline" className="text-xs">
                {post.topicTag}
              </Badge>
            )}
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <ActionMenu
                onView={handleView}
                onDelete={handleDelete}
                deleting={deleting}
                showView={
                  post.type === 'QUIZ' ||
                  post.type === 'ASSIGNMENT'
                }
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Title + description */}
        <h3 className="font-semibold mt-2 leading-tight">
          {post.title}
        </h3>
        {post.description && (
          <p className="text-sm text-muted-foreground
            mt-1 line-clamp-2">
            {post.description}
          </p>
        )}

        {/* Attachments row */}
        {post.attachments.length > 0 && (
          <div className="flex items-center gap-2 mt-3
            flex-wrap">
            {post.attachments.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1
                  text-xs text-muted-foreground bg-muted
                  px-2 py-1 rounded"
              >
                <FileText className="h-3 w-3" />
                {a.fileName ?? 'File'}
              </span>
            ))}
          </div>
        )}

        {/* Type-specific footer */}
        <TypeFooter
          type={post.type}
          dueDate={dueDate ?? null}
          submissionCount={submissionCount}
          attemptCount={attemptCount}
          voteCount={voteCount}
        />
      </div>
    </div>
  )
}

function TypeFooter({
  type,
  dueDate,
  submissionCount,
  attemptCount,
  voteCount,
}: {
  type: string
  dueDate: string | null
  submissionCount: number
  attemptCount: number
  voteCount: number
}) {
  if (type === 'ASSIGNMENT') {
    return (
      <div className="flex items-center gap-4 mt-3
        text-xs text-muted-foreground">
        {dueDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Due{' '}
            {new Date(dueDate).toLocaleDateString()}
          </span>
        )}
        <span>{submissionCount} submissions</span>
      </div>
    )
  }
  if (type === 'QUIZ') {
    return (
      <div className="mt-3 text-xs text-muted-foreground">
        {attemptCount} attempts
      </div>
    )
  }
  if (type === 'POLL') {
    return (
      <div className="mt-3 text-xs text-muted-foreground">
        {voteCount} votes
      </div>
    )
  }
  return null
}

function ActionMenu({
  onView,
  onDelete,
  deleting,
  showView,
  onClose,
}: {
  onView: () => void
  onDelete: () => void
  deleting: boolean
  showView: boolean
  onClose: () => void
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-8 z-50
        w-40 bg-popover border rounded-lg shadow-lg
        py-1">
        {showView && (
          <button
            type="button"
            onClick={onView}
            className="flex items-center gap-2 w-full
              px-3 py-2 text-sm hover:bg-muted
              min-h-[44px]"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-2 w-full
            px-3 py-2 text-sm text-destructive
            hover:bg-muted min-h-[44px]"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </>
  )
}
