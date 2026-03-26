'use client'

import { useState } from 'react'
import {
  hexToHsl, generatePalette,
  type ThemePalette,
} from '@/lib/colorUtils'

interface Props {
  primaryHex: string
  secondaryHex: string
  onChange: (type: 'primary' | 'secondary', hex: string) => void
  palette: ThemePalette
}

function HslDisplay({ hex }: { hex: string }) {
  const hsl = hexToHsl(hex)
  return (
    <span className="text-xs text-muted-foreground font-mono">
      hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
    </span>
  )
}

function PaletteGrid({ hex }: { hex: string }) {
  const palette = generatePalette(hex)
  return (
    <div className="grid grid-cols-2 gap-1.5 pt-1">
      {Object.entries(palette).map(([shade, color]) => (
        <div key={shade} className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded border shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-muted-foreground w-8">
            {shade}
          </span>
          <span className="text-xs font-mono">{color}</span>
        </div>
      ))}
    </div>
  )
}

function ColorInput({
  label,
  hex,
  onColorChange,
  onHexChange,
}: {
  label: string
  hex: string
  onColorChange: (hex: string) => void
  onHexChange: (hex: string) => void
}) {
  const [showPalette, setShowPalette] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <HslDisplay hex={hex} />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={e => onColorChange(e.target.value)}
          className="h-10 w-16 rounded-lg border cursor-pointer
            p-0.5 shrink-0"
        />
        <input
          type="text"
          value={hex}
          onChange={e => {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onHexChange(e.target.value)
            }
          }}
          className="flex-1 h-10 rounded-md border border-input
            bg-background px-3 text-sm font-mono uppercase
            focus:outline-none focus:ring-1 focus:ring-primary"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
      <button
        onClick={() => setShowPalette(p => !p)}
        className="text-xs text-primary hover:underline"
      >
        {showPalette ? 'Hide' : 'Show'} generated palette (11 shades)
      </button>
      {showPalette && <PaletteGrid hex={hex} />}
    </div>
  )
}

export function ColorControls({
  primaryHex, secondaryHex, onChange, palette,
}: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-5">
      <h3 className="font-semibold text-sm">Brand Colors</h3>

      <ColorInput
        label="Primary Color"
        hex={primaryHex}
        onColorChange={hex => onChange('primary', hex)}
        onHexChange={hex => onChange('primary', hex)}
      />

      <div className="border-t" />

      <ColorInput
        label="Secondary Color"
        hex={secondaryHex}
        onColorChange={hex => onChange('secondary', hex)}
        onHexChange={hex => onChange('secondary', hex)}
      />

      {/* Derived colors */}
      <div className="border-t pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          Derived theme colors (auto-generated)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Background', hex: palette.background },
            { label: 'Surface', hex: palette.surface },
            { label: 'Border', hex: palette.border },
            { label: 'Text', hex: palette.textPrimary },
            { label: 'Muted', hex: palette.textMuted },
            { label: 'Success', hex: palette.success },
            { label: 'Warning', hex: palette.warning },
            { label: 'Error', hex: palette.error },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded border shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
