'use client'

import { useState } from 'react'
import { StudentPostCard } from './StudentPostCard'
import type { StreamPost } from './types'

const POST_TYPES = ['ALL', 'MATERIAL', 'ASSIGNMENT', 'QUIZ', 'POLL', 'HOMEWORK']

interface StudentStreamProps {
  posts: StreamPost[]
  subjectId: string
  studentId: string
}

export function StudentStream({ posts, subjectId, studentId }: StudentStreamProps) {
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL'
    ? posts
    : posts.filter((p) => p.type === filter)

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {POST_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium
              whitespace-nowrap min-h-[44px] transition-colors
              ${filter === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          No posts yet.
        </p>
      )}

      {filtered.map((post) => (
        <StudentPostCard
          key={post.id}
          post={post}
          subjectId={subjectId}
          studentId={studentId}
        />
      ))}
    </div>
  )
}
