'use client'

import { useState } from 'react'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  posts: CoursePost[]
  onRefresh: () => void
}

export function CourseContentTab({ courseId, posts, onRefresh }: Props) {
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!title.trim()) return
    setAdding(true)
    await fetch(`/api/school/courses/${courseId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'MATERIAL', title }),
    })
    setTitle('')
    setAdding(false)
    onRefresh()
  }

  const handleDelete = async (postId: string) => {
    setDeleting(postId)
    await fetch(`/api/school/courses/${courseId}/posts/${postId}`, {
      method: 'DELETE',
    })
    setDeleting(null)
    onRefresh()
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New post title..."
          className="min-h-[44px]"
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
        <p className="text-muted-foreground text-center py-8">
          No content yet. Add a post above.
        </p>
      )}

      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-center gap-3 rounded-lg border
            bg-card px-4 py-3"
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
