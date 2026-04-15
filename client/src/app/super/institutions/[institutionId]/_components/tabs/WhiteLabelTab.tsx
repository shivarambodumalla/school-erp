'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, RotateCcw, AlertTriangle, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  generateThemePalette, validateTheme,
} from '@/lib/colorUtils'
import { saveTheme } from '@/features/super/actions/themeActions'
import { LogoUpload } from './whitelabel/LogoUpload'
import { ColorControls } from './whitelabel/ColorControls'
import { ContrastChecker } from './whitelabel/ContrastChecker'
import { ThemePreview } from './whitelabel/ThemePreview'

// Onflows brand defaults — used when "Reset" is clicked
const BRAND_PRIMARY = '#3730A3'
const BRAND_SECONDARY = '#059669'

interface Institution {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string | null
  logoUrl: string | null
  squareLogoUrl: string | null
  faviconUrl: string | null
  planTier: string
  themePalette: unknown
  themeAppliedAt: string | null
}

interface Props {
  institution: Institution
}

export function WhiteLabelTab({ institution }: Props) {
  const router = useRouter()
  const [primaryHex, setPrimaryHex] = useState(institution.primaryColor)
  const [secondaryHex, setSecondaryHex] = useState(
    institution.secondaryColor ?? BRAND_SECONDARY
  )
  const [logoUrl, setLogoUrl] = useState(institution.logoUrl ?? '')
  const [squareLogoUrl, setSquareLogoUrl] = useState(institution.squareLogoUrl ?? '')
  const [faviconUrl, setFaviconUrl] = useState(institution.faviconUrl ?? '')
  const [isDark, setIsDark] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isOnflowsDefaults =
    primaryHex === BRAND_PRIMARY &&
    secondaryHex === BRAND_SECONDARY &&
    logoUrl === '' &&
    squareLogoUrl === '' &&
    faviconUrl === ''

  const palette = generateThemePalette(primaryHex, secondaryHex, isDark)
  const validation = validateTheme(palette)

  const hasChanges =
    primaryHex !== institution.primaryColor ||
    secondaryHex !== (institution.secondaryColor ?? BRAND_SECONDARY) ||
    logoUrl !== (institution.logoUrl ?? '') ||
    squareLogoUrl !== (institution.squareLogoUrl ?? '') ||
    faviconUrl !== (institution.faviconUrl ?? '')

  function handleColorChange(
    type: 'primary' | 'secondary',
    hex: string
  ) {
    if (type === 'primary') setPrimaryHex(hex)
    else setSecondaryHex(hex)
  }

  function handleReset() {
    setPrimaryHex(BRAND_PRIMARY)
    setSecondaryHex(BRAND_SECONDARY)
    setLogoUrl('')
    setSquareLogoUrl('')
    setFaviconUrl('')
  }

  function handleSave() {
    const darkPalette = generateThemePalette(
      primaryHex, secondaryHex, true
    )

    startTransition(async () => {
      const result = await saveTheme({
        institutionId: institution.id,
        primaryColor: primaryHex,
        secondaryColor: secondaryHex,
        logoUrl: logoUrl || null,
        squareLogoUrl: squareLogoUrl || null,
        faviconUrl: faviconUrl || null,
        themePalette: JSON.stringify(palette),
        darkPalette: JSON.stringify(darkPalette),
      })

      if (result.success) {
        toast.success('Theme saved successfully')
        router.refresh()
        window.location.reload()
      } else {
        toast.error(result.error ?? 'Failed to save theme')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border
          border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              You have unsaved changes
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — Controls */}
        <div className="space-y-6">
          <LogoUpload
            currentUrl={logoUrl}
            squareLogoUrl={squareLogoUrl}
            faviconUrl={faviconUrl}
            institutionName={institution.name}
            onLogoChange={setLogoUrl}
            onSquareLogoChange={setSquareLogoUrl}
            onFaviconChange={setFaviconUrl}
          />

          <ColorControls
            primaryHex={primaryHex}
            secondaryHex={secondaryHex}
            onChange={handleColorChange}
            palette={palette}
          />

          <ContrastChecker validation={validation} />

          {/* Reset to Onflows defaults */}
          {!isOnflowsDefaults && (
            <div className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row
              sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Reset to Onflows Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Restore the default Onflows brand colors and remove logo
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-auto" onClick={handleReset}>
                <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Right column — Preview */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium
                  transition-colors ${!isDark
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                Light
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium
                  transition-colors ${isDark
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                Dark
              </button>
            </div>
          </div>

          <ThemePreview
            palette={palette}
            institutionName={institution.name}
            logoUrl={logoUrl}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
        rounded-lg border bg-card p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {institution.themeAppliedAt
              ? `Last saved: ${new Date(institution.themeAppliedAt).toLocaleDateString('en-IN')}`
              : 'Theme has not been saved yet'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Contrast score: {validation.score}/100
            {!validation.allPass && ' — some checks failing (save anyway)'}
          </p>
        </div>
        <Button
          className="shrink-0 self-start sm:self-auto"
          onClick={handleSave}
          disabled={isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Saving...' : 'Save Theme'}
        </Button>
      </div>
    </div>
  )
}
