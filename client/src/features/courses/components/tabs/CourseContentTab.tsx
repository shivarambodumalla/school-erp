'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface CoursePost {
  id: string
  type: string
  title: string
  description: string | null
  topicTag: string | null
  isPublished: boolean
  order: number
}

interface Props {
  courseId: string
  initialPosts?: CoursePost[]
}

export function CourseContentTab({ courseId, initialPosts }: Props) {
  const [posts, setPosts] = useState<CoursePost[]>(initialPosts ?? [])
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/courses/${courseId}`)
      if (!res.ok) return
      const data = await res.json()
      setPosts(data.posts ?? [])
    } catch {
      // keep current
    }
  }, [courseId])

  // Refresh from server if no initial data provided
  useEffect(() => {
    if (!initialPosts) fetchPosts()
  }, [initialPosts, fetchPosts])

  const handleAdd = async () => {
    if (!title.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/school/courses/${courseId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MATERIAL', title }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Post added')
      setTitle('')
      fetchPosts()
    } catch {
      toast.error('Failed to add post')
    }
    setAdding(false)
  }

  const handleDelete = async (postId: string) => {
    setDeleting(postId)
    try {
      const res = await fetch(`/api/school/courses/${courseId}/posts/${postId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Post deleted')
      fetchPosts()
    } catch {
      toast.error('Failed to delete post')
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Content</h2>

      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New post title..."
          className="min-h-[44px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button
          onClick={handleAdd}
          disabled={!title.trim() || adding}
          className="min-h-[44px] shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {posts.length === 0 && (
        <div className="rounded-xl border bg-card p-16 flex flex-col items-center justify-center gap-3 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium">No content yet</p>
          <p className="text-sm text-muted-foreground">Add a post above to get started.</p>
        </div>
      )}

      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
        >
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{post.title}</p>
            <p className="text-xs text-muted-foreground">
              {post.type} | {post.isPublished ? 'Published' : 'Draft'}
            </p>
          </div>
          <button
            onClick={() => handleDelete(post.id)}
            disabled={deleting === post.id}
            className="text-muted-foreground hover:text-destructive
              min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
