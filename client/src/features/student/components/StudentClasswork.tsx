'use client'

import { FileText, ClipboardList, HelpCircle, BookOpen } from 'lucide-react'
import type { StreamPost } from './types'

const TYPE_ICON: Record<string, typeof FileText> = {
  MATERIAL: FileText,
  ASSIGNMENT: ClipboardList,
  QUIZ: HelpCircle,
  HOMEWORK: BookOpen,
}

interface StudentClassworkProps {
  posts: StreamPost[]
}

export function StudentClasswork({ posts }: StudentClassworkProps) {
  const grouped: Record<string, StreamPost[]> = {}

  for (const p of posts) {
    const tag = p.topicTag ?? 'Uncategorised'
    if (!grouped[tag]) grouped[tag] = []
    grouped[tag].push(p)
  }

  const topics = Object.keys(grouped)

  if (topics.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-8 mt-4">
        No classwork yet.
      </p>
    )
  }

  return (
    <div className="space-y-6 mt-4">
      {topics.map((topic) => (
        <div key={topic} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground
            uppercase tracking-wider">
            {topic}
          </h3>
          {grouped[topic].map((post) => {
            const Icon = TYPE_ICON[post.type] ?? FileText
            return (
              <div
                key={post.id}
                className="flex items-center gap-3 rounded-lg border
                  bg-card px-4 py-3"
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.type}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
