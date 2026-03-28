'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Calendar, Tag } from 'lucide-react'
import {
  POST_TYPE_BG,
} from '../types'
import type { SubjectPostData } from '../types'

interface Props {
  subjectId: string
}

interface GroupedPosts {
  tag: string
  posts: SubjectPostData[]
}

export function SubjectClasswork({ subjectId }: Props) {
  const router = useRouter()
  const [posts, setPosts] = useState<SubjectPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState<string | null>(
    null
  )

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/posts?page=1`
      )
      if (!res.ok) {
        setPosts([])
        return
      }
      const data = (await res.json()) as {
        posts: SubjectPostData[]
        total: number
      }
      setPosts(data.posts)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const grouped = groupByTopic(posts)
  const tags = grouped.map((g) => g.tag)
  const filtered = activeTag
    ? grouped.filter((g) => g.tag === activeTag)
    : grouped

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin
          text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex gap-4 flex-col md:flex-row">
      {/* Topic sidebar */}
      <div className="md:w-48 shrink-0 space-y-1">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`w-full text-left px-3 py-2
            rounded text-sm font-medium min-h-[44px]
            ${
              !activeTag
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
        >
          All Topics
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`w-full text-left px-3 py-2
              rounded text-sm min-h-[44px] flex
              items-center gap-2
              ${
                activeTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
          >
            <Tag className="h-3 w-3" />
            {tag}
          </button>
        ))}
      </div>

      {/* Posts by topic */}
      <div className="flex-1 space-y-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground
            text-center py-8">
            No classwork posts found.
          </p>
        ) : (
          filtered.map((group) => (
            <TopicGroup
              key={group.tag}
              group={group}
              onNavigate={(postId, type) => {
                if (type === 'QUIZ') {
                  router.push(
                    `/management/subjects/${subjectId}/posts/${postId}/quiz`
                  )
                } else if (type === 'ASSIGNMENT') {
                  router.push(
                    `/management/subjects/${subjectId}/posts/${postId}/submissions`
                  )
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

function TopicGroup({
  group,
  onNavigate,
}: {
  group: GroupedPosts
  onNavigate: (postId: string, type: string) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground
        uppercase tracking-wider mb-2">
        {group.tag}
      </h3>
      <div className="rounded-xl border divide-y">
        {group.posts.map((post) => {
          const badgeClass =
            POST_TYPE_BG[post.type] ??
            'bg-gray-100 text-gray-700'
          const clickable =
            post.type === 'QUIZ' ||
            post.type === 'ASSIGNMENT'
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                if (clickable)
                  onNavigate(post.id, post.type)
              }}
              className={`w-full flex items-center gap-3
                px-4 py-3 text-left text-sm
                min-h-[44px] transition-colors
                ${clickable ? 'hover:bg-muted cursor-pointer' : ''}`}
            >
              <FileText className="h-4 w-4 shrink-0
                text-muted-foreground" />
              <span className="flex-1 truncate font-medium">
                {post.title}
              </span>
              <span
                className={`shrink-0 px-2 py-0.5
                  rounded-full text-xs font-medium
                  ${badgeClass}`}
              >
                {post.type}
              </span>
              {post.assignment?.dueDate && (
                <span className="shrink-0 flex items-center
                  gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(
                    post.assignment.dueDate
                  ).toLocaleDateString()}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function groupByTopic(
  posts: SubjectPostData[]
): GroupedPosts[] {
  const map = new Map<string, SubjectPostData[]>()
  for (const post of posts) {
    const tag = post.topicTag ?? 'Uncategorized'
    const list = map.get(tag) ?? []
    list.push(post)
    map.set(tag, list)
  }
  const result: GroupedPosts[] = []
  for (const [tag, tagPosts] of Array.from(map.entries())) {
    if (tag !== 'Uncategorized') {
      result.push({ tag, posts: tagPosts })
    }
  }
  const uncategorized = map.get('Uncategorized')
  if (uncategorized?.length) {
    result.push({
      tag: 'Uncategorized',
      posts: uncategorized,
    })
  }
  return result
}
