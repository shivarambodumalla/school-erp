'use client'

import { useState } from 'react'
import { Upload, Link as LinkIcon, ImageIcon, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  currentUrl: string
  squareLogoUrl: string
  faviconUrl: string
  institutionName: string
  onLogoChange: (url: string) => void
  onSquareLogoChange: (url: string) => void
  onFaviconChange: (url: string) => void
}

export function LogoUpload({
  currentUrl, squareLogoUrl, faviconUrl,
  institutionName,
  onLogoChange, onSquareLogoChange, onFaviconChange,
}: Props) {
  const initials = institutionName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-4">
      {/* Main Logo */}
      <ImageUploadCard
        title="School Logo"
        description="Used in sidebar, emails, and reports"
        recommendation="Recommended: 512×512px PNG or SVG"
        currentUrl={currentUrl}
        fallback={initials}
        previewClass="h-16 w-16 rounded-xl"
        institutionName={institutionName}
        onChange={onLogoChange}
      />

      {/* Square Logo + Favicon row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploadCard
          title="Square Logo"
          description="Optional — app icon, compact views"
          recommendation="Recommended: 180×180px PNG"
          currentUrl={squareLogoUrl}
          fallback={initials.slice(0, 1)}
          previewClass="h-12 w-12 rounded-lg"
          institutionName={institutionName}
          onChange={onSquareLogoChange}
          compact
        />

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Favicon</h3>
          <div className="space-y-2">
            <FaviconPreview url={faviconUrl} fallbackInitial={initials.slice(0, 1)} institutionName={institutionName} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Browser tab icon · 32×32px PNG or ICO
              </p>
              {faviconUrl && (
                <button
                  onClick={() => onFaviconChange('')}
                  className="text-xs text-red-500 hover:underline mt-0.5"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <SimpleFileUpload
            accept="image/png,image/x-icon,image/svg+xml"
            onChange={onFaviconChange}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Favicon browser-tab preview ── */

function FaviconPreview({
  url, fallbackInitial, institutionName,
}: {
  url: string
  fallbackInitial: string
  institutionName: string
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="w-full max-w-[224px]">
      {/* Browser tab mockup */}
      <div className="rounded-t-lg border border-b-0 bg-muted/60 px-2.5 py-1.5
        flex items-center gap-2 overflow-hidden">
        <div className="h-4 w-4 rounded shrink-0 bg-background border
          flex items-center justify-center overflow-hidden">
          {url && !imgError ? (
            <img
              src={url}
              alt="Favicon"
              className="h-3 w-3 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[6px] font-bold text-muted-foreground">
              {fallbackInitial}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground truncate">
          {institutionName}
        </span>
        <span className="text-[10px] text-muted-foreground/40 ml-auto shrink-0">×</span>
      </div>
      {/* Address bar */}
      <div className="rounded-b-lg border bg-background px-2.5 py-1
        flex items-center gap-1.5">
        <Globe className="h-2.5 w-2.5 text-muted-foreground/50" />
        <span className="text-[9px] text-muted-foreground/60 truncate">
          {institutionName.toLowerCase().replace(/\s+/g, '')}.onflows.app
        </span>
      </div>
    </div>
  )
}

/* ── Reusable image upload card ── */

function ImageUploadCard({
  title, description, recommendation,
  currentUrl, fallback, previewClass,
  institutionName, onChange, compact,
}: {
  title: string
  description: string
  recommendation: string
  currentUrl: string
  fallback: string
  previewClass: string
  institutionName: string
  onChange: (url: string) => void
  compact?: boolean
}) {
  const [tab, setTab] = useState<'url' | 'upload'>('upload')
  const [urlInput, setUrlInput] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [imgError, setImgError] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>

      {/* Preview */}
      <div className="flex items-center gap-3">
        <div className={`${previewClass} border overflow-hidden bg-muted
          flex items-center justify-center shrink-0`}>
          {currentUrl && !imgError ? (
            <img
              src={currentUrl}
              alt={institutionName}
              className="h-full w-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className={`font-bold text-muted-foreground
              ${compact ? 'text-sm' : 'text-xl'}`}>
              {fallback}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            {recommendation}
          </p>
          {currentUrl && (
            <button
              onClick={() => onChange('')}
              className="text-xs text-red-500 hover:underline mt-0.5"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        {(['upload', 'url'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center
              gap-1.5 py-1.5 text-xs font-medium transition-colors
              ${tab === t
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
              }`}
          >
            {t === 'url'
              ? <LinkIcon className="h-3 w-3" />
              : <Upload className="h-3 w-3" />
            }
            {t === 'url' ? 'URL' : 'Upload'}
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
        <label className={`flex flex-col items-center justify-center
          ${compact ? 'h-16' : 'h-20'} rounded-lg border-2 border-dashed
          border-muted-foreground/25 hover:border-primary/50
          cursor-pointer transition-colors gap-1.5`}>
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full
              border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <ImageIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-muted-foreground`} />
              <span className="text-xs text-muted-foreground">
                Click to upload
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
      )}
    </div>
  )
}

/* ── Simple file upload (no URL option) ── */

function SimpleFileUpload({
  accept, onChange,
}: {
  accept: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = event => {
      onChange(event.target?.result as string)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <label className="flex flex-col items-center justify-center
      h-16 rounded-lg border-2 border-dashed
      border-muted-foreground/25 hover:border-primary/50
      cursor-pointer transition-colors gap-1.5">
      {uploading ? (
        <div className="h-4 w-4 animate-spin rounded-full
          border-2 border-primary border-t-transparent" />
      ) : (
        <>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Click to upload
          </span>
        </>
      )}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </label>
  )
}
