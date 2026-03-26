// ── Types ──────────────────────────────────────────

export interface HSL {
  h: number  // 0-360
  s: number  // 0-100
  l: number  // 0-100
}

export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface ThemePalette {
  primary: ColorPalette
  secondary: ColorPalette
  background: string
  surface: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ContrastResult {
  ratio: number
  aa: boolean
  aaLarge: boolean
  aaa: boolean
  label: string
}

export interface ThemeValidation {
  checks: {
    label: string
    foreground: string
    background: string
    result: ContrastResult
  }[]
  allPass: boolean
  score: number
}

// ── Conversion Functions ───────────────────────────

export function hexToHsl(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r: h = ((g - b) / delta) % 6; break
      case g: h = (b - r) / delta + 2; break
      case b: h = (r - g) / delta + 4; break
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const a = sNorm * Math.min(lNorm, 1 - lNorm)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function hslToString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`
}

// ── Palette Generation ─────────────────────────────

export function generatePalette(hex: string): ColorPalette {
  const { h, s } = hexToHsl(hex)
  const shades: Record<string, number> = {
    50: 97, 100: 93, 200: 85, 300: 74, 400: 62,
    500: 50, 600: 42, 700: 35, 800: 27, 900: 20, 950: 13,
  }
  const palette: Partial<ColorPalette> = {}
  for (const [key, lightness] of Object.entries(shades)) {
    palette[key as unknown as keyof ColorPalette] =
      hslToHex(h, s, lightness)
  }
  return palette as ColorPalette
}

export function generateThemePalette(
  primaryHex: string,
  secondaryHex: string,
  isDark = false
): ThemePalette {
  const primary = generatePalette(primaryHex)
  const secondary = generatePalette(secondaryHex)
  const { h: ph } = hexToHsl(primaryHex)
  return {
    primary,
    secondary,
    background: isDark
      ? hslToHex(ph, 10, 8)
      : hslToHex(ph, 20, 98),
    surface: isDark
      ? hslToHex(ph, 10, 12)
      : hslToHex(ph, 20, 96),
    border: isDark
      ? hslToHex(ph, 10, 20)
      : hslToHex(ph, 15, 88),
    textPrimary: isDark
      ? hslToHex(ph, 10, 95)
      : hslToHex(ph, 15, 10),
    textSecondary: isDark
      ? hslToHex(ph, 10, 70)
      : hslToHex(ph, 10, 35),
    textMuted: isDark
      ? hslToHex(ph, 5, 50)
      : hslToHex(ph, 5, 55),
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: primaryHex,
  }
}

// ── WCAG Contrast ──────────────────────────────────

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) =>
    c <= 0.03928
      ? c / 12.92
      : Math.pow((c + 0.055) / 1.055, 2.4)
  return (
    0.2126 * toLinear(r) +
    0.7152 * toLinear(g) +
    0.0722 * toLinear(b)
  )
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
}

export function checkContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background)
  const aaa = ratio >= 7
  const aa = ratio >= 4.5
  const aaLarge = ratio >= 3
  let label = 'Fail'
  if (aaa) label = 'AAA'
  else if (aa) label = 'AA'
  else if (aaLarge) label = 'AA Large'
  return { ratio, aa, aaLarge, aaa, label }
}

export function validateTheme(palette: ThemePalette): ThemeValidation {
  const checks = [
    {
      label: 'Primary button text',
      foreground: '#ffffff',
      background: palette.primary[500],
    },
    {
      label: 'Primary on background',
      foreground: palette.primary[600],
      background: palette.background,
    },
    {
      label: 'Body text',
      foreground: palette.textPrimary,
      background: palette.background,
    },
    {
      label: 'Muted text',
      foreground: palette.textMuted,
      background: palette.background,
    },
    {
      label: 'Text on surface',
      foreground: palette.textPrimary,
      background: palette.surface,
    },
    {
      label: 'Secondary button',
      foreground: '#ffffff',
      background: palette.secondary[500],
    },
  ]
  const results = checks.map(c => ({
    ...c,
    result: checkContrast(c.foreground, c.background),
  }))
  const passing = results.filter(r => r.result.aa).length
  return {
    checks: results,
    allPass: passing === results.length,
    score: Math.round((passing / results.length) * 100),
  }
}
