'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostCard } from './PostCard'
import { CreatePostSheet } from './CreatePostSheet'
import type { SubjectPostData } from '../types'

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Material', value: 'MATERIAL' },
  { label: 'Assignment', value: 'ASSIGNMENT' },
  { label: 'Quiz', value: 'QUIZ' },
  { label: 'Poll', value: 'POLL' },
  { label: 'Homework', value: 'HOMEWORK' },
  { label: 'Announcement', value: 'ANNOUNCEMENT' },
]

interface Props {
  subjectId: string
}

export function SubjectStream({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const [posts, setPosts] = useState<SubjectPostData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('type', filter)
      params.set('page', String(page))
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/posts?${params}`
      )
      if (!res.ok) {
        setPosts([])
        setTotal(0)
        return
      }
      const data = (await res.json()) as {
        posts: SubjectPostData[]
        total: number
      }
      setPosts(data.posts)
      setTotal(data.total)
    } catch {
      setPosts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [subjectId, filter, page, addParams])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    setPage(1)
  }, [filter])

  const handleCreated = () => {
    setShowCreate(false)
    fetchPosts()
  }

  const handleDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setTotal((prev) => prev - 1)
  }

  return (
    <div className="space-y-4">
      {/* Filter pills + create button */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs
                font-medium transition-colors min-h-[36px]
                ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="sm"
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin
            text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border bg-card p-16
          flex flex-col items-center justify-center gap-3
          text-center">
          <p className="font-medium">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first post to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              subjectId={subjectId}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center
          gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="min-h-[44px]"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-[44px]"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create post sheet */}
      <CreatePostSheet
        open={showCreate}
        onOpenChange={setShowCreate}
        subjectId={subjectId}
        onCreated={handleCreated}
      />
    </div>
  )
}
