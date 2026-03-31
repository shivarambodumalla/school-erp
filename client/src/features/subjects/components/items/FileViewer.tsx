'use client'

import { Download, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
}

export function FileViewer({ item }: Props) {
  const fileUrl = item.fileUrl ?? ''
  const fileName = item.fileName ?? 'File'
  const isPdf =
    fileName.toLowerCase().endsWith('.pdf') ||
    fileUrl.toLowerCase().includes('.pdf')

  return (
    <div className="space-y-4">
      {/* Preview iframe for PDFs */}
      {item.canPreview && isPdf && fileUrl ? (
        <div
          className="relative w-full overflow-hidden
            rounded-xl border bg-muted"
          style={{ height: '70vh', minHeight: '400px' }}
        >
          <iframe
            src={`${fileUrl}#view=FitH`}
            title={fileName}
            className="h-full w-full"
          />
        </div>
      ) : item.canPreview && fileUrl ? (
        <div
          className="rounded-xl border bg-card p-8
            flex flex-col items-center justify-center gap-4"
        >
          <div
            className="h-16 w-16 rounded-full bg-blue-50
              flex items-center justify-center"
          >
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Preview is available for PDF files only. Use the
              download button below.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border bg-card p-8
            flex flex-col items-center justify-center gap-4"
        >
          <div
            className="h-16 w-16 rounded-full bg-muted
              flex items-center justify-center"
          >
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">{fileName}</p>
        </div>
      )}

      {/* Download button */}
      {item.canDownload && fileUrl && (
        <div className="flex justify-center">
          <Button
            asChild
            className="min-h-[44px] gap-2"
          >
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download {fileName}
            </a>
          </Button>
        </div>
      )}

      {/* Estimated time */}
      {item.estimatedMinutes && (
        <p className="text-sm text-muted-foreground text-center">
          Estimated reading time: {item.estimatedMinutes} minutes
        </p>
      )}
    </div>
  )
}
