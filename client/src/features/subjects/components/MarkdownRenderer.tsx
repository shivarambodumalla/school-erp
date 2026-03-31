'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface Props {
  content: string
  className?: string
}

/**
 * Renders markdown with LaTeX formula support.
 * - Inline formulas: $E = mc^2$
 * - Block formulas: $$\int_0^1 x^2 dx$$
 */
export function MarkdownRenderer({ content, className }: Props) {
  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert
        prose-headings:font-semibold prose-a:text-primary
        prose-code:rounded prose-code:bg-muted prose-code:px-1
        prose-code:py-0.5 prose-code:text-sm
        prose-pre:bg-muted prose-pre:rounded-lg
        ${className ?? ''}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
