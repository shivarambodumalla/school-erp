'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Loader2,
  MessageSquare,
  ArrowUp,
  Reply,
  CheckCircle2,
  Send,
  User,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// ─── Types ───

interface DiscussionListItem {
  id: string
  title: string
  prompt: string
  replyCount: number
  lastActivityAt: string
  isUnread: boolean
  createdBy: string
  createdAt: string
}

interface DiscussionReply {
  id: string
  content: string
  authorName: string
  authorPhoto: string | null
  isAnonymous: boolean
  isBestAnswer: boolean
  upvotes: number
  hasUpvoted: boolean
  createdAt: string
  parentId: string | null
  children: DiscussionReply[]
}

interface DiscussionDetail {
  id: string
  title: string
  prompt: string
  createdBy: string
  createdAt: string
  replies: DiscussionReply[]
}

// ─── Props ───

interface Props {
  subjectId: string
}

export function DiscussionsView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const [discussions, setDiscussions] = useState<DiscussionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DiscussionDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/discussions?${params}`
      )
      if (res.ok) {
        const data = (await res.json()) as {
          discussions: DiscussionListItem[]
        }
        setDiscussions(data.discussions ?? [])
      }
    } catch {
      setDiscussions([])
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchDiscussions()
  }, [fetchDiscussions])

  const fetchDetail = useCallback(async (discussionId: string) => {
    setLoadingDetail(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/discussions/${discussionId}?${params}`
      )
      if (res.ok) {
        const data = (await res.json()) as DiscussionDetail
        setDetail(data)
      }
    } catch {
      setDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [subjectId, addParams])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    fetchDetail(id)
    // Mark as read
    setDiscussions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isUnread: false } : d))
    )
  }

  const handleReplyAdded = () => {
    if (selectedId) {
      fetchDetail(selectedId)
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === selectedId
            ? { ...d, replyCount: d.replyCount + 1, lastActivityAt: new Date().toISOString() }
            : d
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {discussions.length} discussion{discussions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {discussions.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 flex flex-col
          items-center justify-center gap-3 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No discussions yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4
          min-h-[60vh]">
          {/* Left: discussion list */}
          <div className={`lg:col-span-4 space-y-2 overflow-y-auto
            max-h-[70vh] ${selectedId ? 'hidden lg:block' : ''}`}>
            {discussions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelect(d.id)}
                className={`w-full text-left rounded-xl border p-3
                  transition-colors min-h-[44px]
                  ${selectedId === d.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                  }`}
              >
                <div className="flex items-start gap-2">
                  {d.isUnread && (
                    <span className="mt-1.5 h-2 w-2 rounded-full
                      bg-primary shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {d.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1
                      text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" />
                        {d.replyCount}
                      </span>
                      <span>&middot;</span>
                      <span>
                        {formatRelative(d.lastActivityAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: thread detail */}
          <div className={`lg:col-span-8 rounded-xl border bg-card
            flex flex-col overflow-hidden
            ${!selectedId ? 'hidden lg:flex' : ''}`}>
            {!selectedId ? (
              <div className="flex-1 flex items-center justify-center
                text-sm text-muted-foreground">
                Select a discussion to view
              </div>
            ) : loadingDetail ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin
                  text-muted-foreground" />
              </div>
            ) : detail ? (
              <ThreadView
                detail={detail}
                subjectId={subjectId}
                onBack={() => setSelectedId(null)}
                onReplyAdded={handleReplyAdded}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center
                text-sm text-muted-foreground">
                Failed to load discussion.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Thread View ───

function ThreadView({
  detail,
  subjectId,
  onBack,
  onReplyAdded,
}: {
  detail: DiscussionDetail
  subjectId: string
  onBack: () => void
  onReplyAdded: () => void
}) {
  const [replyText, setReplyText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const { addParams } = useInstitutionId()

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/discussions/${detail.id}/replies?${params}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: replyText.trim(),
            isAnonymous,
            parentId: replyingTo,
          }),
        }
      )
      if (res.ok) {
        setReplyText('')
        setReplyingTo(null)
        onReplyAdded()
        toast.success('Reply posted')
      } else {
        toast.error('Failed to post reply')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSending(false)
    }
  }

  const handleUpvote = async (replyId: string) => {
    try {
      const params = new URLSearchParams()
      addParams(params)
      await fetch(
        `/api/school/subjects/${subjectId}/discussions/${detail.id}/replies/${replyId}/upvote?${params}`,
        { method: 'POST' }
      )
      onReplyAdded()
    } catch {
      // Silently fail
    }
  }

  const handleBestAnswer = async (replyId: string) => {
    try {
      const params = new URLSearchParams()
      addParams(params)
      await fetch(
        `/api/school/subjects/${subjectId}/discussions/${detail.id}/replies/${replyId}/best-answer?${params}`,
        { method: 'POST' }
      )
      onReplyAdded()
      toast.success('Marked as best answer')
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile back button */}
      <div className="lg:hidden border-b p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="min-h-[44px]"
        >
          Back to discussions
        </Button>
      </div>

      {/* Prompt card */}
      <div className="border-b p-4 bg-muted/30">
        <h2 className="text-lg font-semibold">{detail.title}</h2>
        <p className="text-sm mt-2 whitespace-pre-wrap">{detail.prompt}</p>
        <p className="text-xs text-muted-foreground mt-2">
          by {detail.createdBy} &middot;{' '}
          {formatRelative(detail.createdAt)}
        </p>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {detail.replies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No replies yet. Be the first to respond.
          </p>
        ) : (
          detail.replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              depth={0}
              onReply={(id) => setReplyingTo(id)}
              onUpvote={handleUpvote}
              onBestAnswer={handleBestAnswer}
            />
          ))
        )}
      </div>

      {/* Reply input */}
      <div className="border-t p-3 space-y-2">
        {replyingTo && (
          <div className="flex items-center justify-between text-xs
            text-muted-foreground bg-muted/50 rounded px-2 py-1">
            <span>Replying to a comment</span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-primary text-xs min-h-[28px]"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="flex-1 text-sm"
          />
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              onClick={handleSubmitReply}
              disabled={sending || !replyText.trim()}
              className="min-h-[44px] min-w-[44px]"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center justify-center h-8 w-11
                rounded text-xs transition-colors
                ${isAnonymous
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
                }`}
              title={isAnonymous ? 'Posting anonymously' : 'Post with name'}
            >
              {isAnonymous ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reply Card ───

function ReplyCard({
  reply,
  depth,
  onReply,
  onUpvote,
  onBestAnswer,
}: {
  reply: DiscussionReply
  depth: number
  onReply: (id: string) => void
  onUpvote: (id: string) => void
  onBestAnswer: (id: string) => void
}) {
  const maxDepth = 2

  return (
    <div
      className={`${depth > 0 ? 'ml-6 sm:ml-8' : ''}
        ${reply.isBestAnswer
          ? 'rounded-lg border-2 border-green-300 bg-green-50/50 p-3'
          : ''
        }`}
    >
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-muted flex items-center
          justify-center shrink-0 mt-0.5">
          {reply.authorPhoto && !reply.isAnonymous ? (
            <img
              src={reply.authorPhoto}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {reply.isAnonymous ? 'Anonymous' : reply.authorName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelative(reply.createdAt)}
            </span>
            {reply.isBestAnswer && (
              <Badge variant="secondary"
                className="bg-green-100 text-green-700 text-xs">
                Best Answer
              </Badge>
            )}
          </div>

          {/* Content */}
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {reply.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => onUpvote(reply.id)}
              className={`flex items-center gap-1 text-xs
                min-h-[28px] transition-colors
                ${reply.hasUpvoted
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {reply.upvotes > 0 && reply.upvotes}
            </button>

            {depth < maxDepth && (
              <button
                type="button"
                onClick={() => onReply(reply.id)}
                className="flex items-center gap-1 text-xs
                  text-muted-foreground hover:text-foreground
                  min-h-[28px] transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            )}

            <button
              type="button"
              onClick={() => onBestAnswer(reply.id)}
              className="flex items-center gap-1 text-xs
                text-muted-foreground hover:text-green-600
                min-h-[28px] transition-colors"
              title="Mark as best answer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Nested replies (max 2 levels) */}
      {reply.children.length > 0 && depth < maxDepth && (
        <div className="mt-3 space-y-3">
          {reply.children.map((child) => (
            <ReplyCard
              key={child.id}
              reply={child}
              depth={depth + 1}
              onReply={onReply}
              onUpvote={onUpvote}
              onBestAnswer={onBestAnswer}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}
