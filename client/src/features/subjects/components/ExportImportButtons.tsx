'use client'

import { useState, useRef } from 'react'
import {
  Download,
  Upload,
  Loader2,
  FileJson,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  subjectId: string
}

interface ImportPreview {
  modules: number
  items: number
  raw: Record<string, unknown>
}

export function ExportImportButtons({ subjectId }: Props) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(
    null
  )
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setExporting(true)
    toast.info('Preparing export...')
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/export`,
        { method: 'POST' }
      )
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `subject-${subjectId}-export.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Export complete')
      } else {
        toast.error('Export failed')
      }
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text) as Record<
        string,
        unknown
      >

      // Count modules and items from the JSON structure
      const modules = Array.isArray(json.modules)
        ? json.modules.length
        : 0
      let items = 0
      if (Array.isArray(json.modules)) {
        for (const mod of json.modules) {
          const m = mod as Record<string, unknown>
          if (Array.isArray(m.items)) {
            items += m.items.length
          }
        }
      }
      // Also count top-level posts if present
      if (Array.isArray(json.posts)) {
        items += (json.posts as unknown[]).length
      }

      setPreview({ modules, items, raw: json })
      setShowPreview(true)
    } catch {
      toast.error('Invalid JSON file')
    }

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (!preview) return
    setImporting(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/import`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preview.raw),
        }
      )
      if (res.ok) {
        const result = (await res.json()) as {
          modules: number
          items: number
        }
        toast.success(
          `Imported ${result.modules} modules, ${result.items} items`
        )
        setShowPreview(false)
        setPreview(null)
      } else {
        toast.error('Import failed')
      }
    } catch {
      toast.error('Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="min-h-[44px]"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-1.5
              animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-1.5" />
          )}
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFileSelect}
          className="min-h-[44px]"
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Import Preview Dialog */}
      <Dialog
        open={showPreview}
        onOpenChange={(v) => {
          if (!v) {
            setShowPreview(false)
            setPreview(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the content to be imported
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <FileJson className="h-8 w-8
                  text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Found {preview.modules} module
                    {preview.modules !== 1 ? 's' : ''}
                    {preview.items > 0 && (
                      <>
                        , {preview.items} item
                        {preview.items !== 1 ? 's' : ''}
                      </>
                    )}
                  </p>
                  <p className="text-xs
                    text-muted-foreground mt-0.5">
                    Content will be added to this subject
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2
                text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5
                  text-green-600" />
                Existing content will not be affected
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false)
                setPreview(null)
              }}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={importing}
              className="min-h-[44px]"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2
                  animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
