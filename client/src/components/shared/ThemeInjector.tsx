'use client'

import { useEffect } from 'react'
import { hexToHsl } from '@/lib/colorUtils'

interface ThemeInjectorProps {
  primaryColor: string
  secondaryColor?: string | null
}

function toHsl(hex: string): string {
  const { h, s, l } = hexToHsl(hex)
  return `${h} ${s}% ${l}%`
}

function derivePalette(primaryHex: string, secondaryHex: string | null) {
  const { h: ph } = hexToHsl(primaryHex)

  // Generate all CSS variables from the primary color hue
  const vars: Record<string, string> = {
    // Primary
    '--primary': toHsl(primaryHex),
    '--primary-foreground': '0 0% 100%',
    '--ring': toHsl(primaryHex),

    // Background & surface — tinted toward the primary hue
    '--background': `${ph} 20% 97%`,
    '--card': `${ph} 20% 97%`,
    '--card-foreground': `${ph} 17% 10%`,
    '--popover': '0 0% 100%',
    '--popover-foreground': `${ph} 18% 13%`,

    // Muted
    '--muted': `${ph} 20% 90%`,
    '--muted-foreground': `${ph} 2% 50%`,

    // Accent
    '--accent': `${ph} 16% 88%`,
    '--accent-foreground': `${ph} 18% 13%`,

    // Border & input
    '--border': `${ph} 4% 84%`,
    '--input': `${ph} 5% 68%`,

    // Sidebar
    '--sidebar': `${ph} 13% 95%`,
    '--sidebar-foreground': `${ph} 3% 24%`,
    '--sidebar-primary': toHsl(primaryHex),
    '--sidebar-primary-foreground': '0 0% 98%',
    '--sidebar-accent': `${ph} 16% 88%`,
    '--sidebar-accent-foreground': '0 0% 20%',

    // Charts
    '--chart-1': `${ph} 58% 44%`,
    '--chart-5': `${ph} 61% 44%`,
  }

  // Secondary
  if (secondaryHex) {
    vars['--secondary'] = toHsl(secondaryHex)
    vars['--secondary-foreground'] = '0 0% 100%'
  }

  return vars
}

export function ThemeInjector({ primaryColor, secondaryColor }: ThemeInjectorProps) {
  useEffect(() => {
    const root = document.documentElement
    const vars = derivePalette(primaryColor, secondaryColor ?? null)

    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value)
    }

    return () => {
      for (const prop of Object.keys(vars)) {
        root.style.removeProperty(prop)
      }
    }
  }, [primaryColor, secondaryColor])

  return null
}