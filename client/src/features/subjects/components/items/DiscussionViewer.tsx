'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Send,
  Loader2,
  Clock,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
  subjectId: string
}

interface DiscussionReply {
  id: string
  content: string
  authorName: string
  isAnonymous: boolean
  createdAt: string
  replies: DiscussionReply[]
}

export function DiscussionViewer({ item, subjectId }: Props) {
  const [replies, setReplies] = useState<DiscussionReply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isClosed = item.closeDate
    ? new Date(item.closeDate) < new Date()
    : false

  const fetchReplies = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/items/${item.id}/discussion`
      )
      if (res.ok) {
        const data = (await res.json()) as {
          replies: DiscussionReply[]
        }
        setReplies(data.replies)
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [subjectId, item.id])

  useEffect(() => {
    fetchReplies()
  }, [fetchReplies])

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isClosed) return
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/items/${item.id}/discussion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: replyText.trim(),
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to post reply')
      setReplyText('')
      toast.success('Reply posted')
      fetchReplies()
    } catch {
      toast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Discussion prompt */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-full bg-teal-50
              flex items-center justify-center shrink-0"
          >
            <MessageSquare className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Discussion Prompt
            </p>
            <p className="text-sm mt-1">
              {item.prompt ?? item.description ?? 'Share your thoughts.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {item.allowAnonymous && (
            <Badge variant="outline" className="text-xs">
              Anonymous replies allowed
            </Badge>
          )}
          {item.closeDate && (
            <Badge
              variant={isClosed ? 'destructive' : 'outline'}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {isClosed
                ? 'Discussion closed'
                : `Closes ${new Date(item.closeDate).toLocaleDateString()}`}
            </Badge>
          )}
        </div>
      </div>

      {/* Reply input */}
      {!isClosed && (
        <div className="flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={handleSubmitReply}
            disabled={submitting || !replyText.trim()}
            size="icon"
            className="shrink-0 self-end min-h-[44px] min-w-[44px]"
            aria-label="Post reply"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Replies list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : replies.length === 0 ? (
        <div
          className="rounded-xl border bg-card p-8 text-center
            text-muted-foreground"
        >
          <p className="text-sm">
            No replies yet. Be the first to share your
            thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReplyCard({ reply }: { reply: DiscussionReply }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-6 w-6 rounded-full bg-muted
            flex items-center justify-center"
        >
          <User className="h-3 w-3 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">
          {reply.isAnonymous
            ? 'Anonymous'
            : reply.authorName}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(reply.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-sm ml-8">{reply.content}</p>

      {/* Nested replies */}
      {reply.replies.length > 0 && (
        <div className="ml-8 mt-3 space-y-2 pl-3 border-l-2">
          {reply.replies.map((nested) => (
            <ReplyCard key={nested.id} reply={nested} />
          ))}
        </div>
      )}
    </div>
  )
}
