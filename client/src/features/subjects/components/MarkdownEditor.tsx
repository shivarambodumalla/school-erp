'use client'

import { useState, useRef, useCallback } from 'react'
import { Eye, EyeOff, FunctionSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownRenderer } from './MarkdownRenderer'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write content using Markdown. Use $...$ for inline formulas and $$...$$ for block formulas.',
  minRows = 8,
  className,
}: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertFormula = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)

    if (selectedText) {
      // Wrap selection in formula delimiters
      const newValue =
        value.slice(0, start) +
        `$$${selectedText}$$` +
        value.slice(end)
      onChange(newValue)
    } else {
      // Insert empty formula placeholder
      const newValue =
        value.slice(0, start) + '$$  $$' + value.slice(end)
      onChange(newValue)
      // Position cursor inside the formula
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 3, start + 3)
      })
    }
  }, [value, onChange])

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertFormula}
          title="Insert formula (LaTeX)"
          className="h-8 gap-1 text-xs"
        >
          <FunctionSquare className="h-3.5 w-3.5" />
          Formula
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 gap-1 text-xs"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="min-h-[200px] rounded-md border p-4">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing to preview
            </p>
          )}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="font-mono text-sm"
        />
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground mt-1.5">
        Supports Markdown and LaTeX. Use <code className="bg-muted px-1 rounded">$...$</code> for
        inline math, <code className="bg-muted px-1 rounded">$$...$$</code> for block formulas.
      </p>
    </div>
  )
}
