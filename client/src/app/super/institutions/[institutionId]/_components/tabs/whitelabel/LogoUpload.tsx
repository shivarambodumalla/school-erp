'use client'

import { useState } from 'react'
import { Upload, Link as LinkIcon, ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  currentUrl: string
  institutionName: string
  onChange: (url: string) => void
}

export function LogoUpload({
  currentUrl, institutionName, onChange,
}: Props) {
  const [tab, setTab] = useState<'url' | 'upload'>('url')
  const [urlInput, setUrlInput] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [imgError, setImgError] = useState(false)

  const initials = institutionName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = event => {
      const dataUrl = event.target?.result as string
      onChange(dataUrl)
      setImgError(false)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  function handleUrlApply() {
    setImgError(false)
    onChange(urlInput)
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <h3 className="font-semibold text-sm">School Logo</h3>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl border overflow-hidden
          bg-muted flex items-center justify-center shrink-0">
          {currentUrl && !imgError ? (
            <img
              src={currentUrl}
              alt={institutionName}
              className="h-full w-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xl font-bold text-muted-foreground">
              {initials}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{institutionName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recommended: 512x512px PNG or SVG
          </p>
          {currentUrl && (
            <button
              onClick={() => onChange('')}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Remove logo
            </button>
          )}
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        {(['url', 'upload'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center
              gap-1.5 py-2 text-xs font-medium transition-colors
              ${tab === t
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
              }`}
          >
            {t === 'url'
              ? <LinkIcon className="h-3.5 w-3.5" />
              : <Upload className="h-3.5 w-3.5" />
            }
            {t === 'url' ? 'Paste URL' : 'Upload File'}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <div className="flex gap-2">
          <Input
            placeholder="https://school.com/logo.png"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="flex-1 text-sm"
          />
          <Button variant="outline" size="sm" onClick={handleUrlApply}>
            Apply
          </Button>
        </div>
      ) : (
        <div>
          <label className="flex flex-col items-center justify-center
            h-24 rounded-lg border-2 border-dashed
            border-muted-foreground/25 hover:border-primary/50
            cursor-pointer transition-colors gap-2">
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full
                border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Click to upload or drag and drop
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-muted-foreground mt-1.5">
            Stored as preview only. S3 upload available in Phase 4.
          </p>
        </div>
      )}
    </div>
  )
}
