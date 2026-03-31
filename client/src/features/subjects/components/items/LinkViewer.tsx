'use client'

import { ExternalLink, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
}

export function LinkViewer({ item }: Props) {
  const url = item.url ?? ''

  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {
    hostname = url
  }

  return (
    <div
      className="rounded-xl border bg-card p-6
        flex flex-col items-center gap-4 text-center"
    >
      {/* Link preview card */}
      <div
        className="h-16 w-16 rounded-full bg-cyan-50
          flex items-center justify-center"
      >
        <Globe className="h-8 w-8 text-cyan-600" />
      </div>
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {hostname}
        </p>
      </div>
      {url && (
        <Button
          asChild
          className="min-h-[44px] gap-2"
        >
          <a
            href={url}
            target={item.openInNewTab ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Open Link
          </a>
        </Button>
      )}
    </div>
  )
}
