'use client'

import { MarkdownRenderer } from '../MarkdownRenderer'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
}

export function TextViewer({ item }: Props) {
  const content = item.content ?? ''

  if (!content.trim()) {
    return (
      <div
        className="rounded-xl border bg-card p-8 text-center
          text-muted-foreground"
      >
        <p className="text-sm">No content available</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <MarkdownRenderer content={content} />
    </div>
  )
}
