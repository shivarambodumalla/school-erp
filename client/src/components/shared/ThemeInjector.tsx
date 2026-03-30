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

function buildCssVars(primaryHex: string, secondaryHex: string | null, dark: boolean) {
  const { h: ph } = hexToHsl(primaryHex)

  const vars: Record<string, string> = dark
    ? {
        '--primary': toHsl(primaryHex),
        '--primary-foreground': '0 0% 100%',
        '--ring': toHsl(primaryHex),
        '--background': `${ph} 10% 8%`,
        '--card': `${ph} 10% 8%`,
        '--card-foreground': `${ph} 8% 90%`,
        '--popover': `${ph} 8% 12%`,
        '--popover-foreground': `${ph} 5% 85%`,
        '--muted': `${ph} 8% 15%`,
        '--muted-foreground': `${ph} 5% 55%`,
        '--accent': `${ph} 8% 18%`,
        '--accent-foreground': `${ph} 5% 90%`,
        '--border': `${ph} 6% 22%`,
        '--input': `${ph} 6% 28%`,
        '--sidebar': `${ph} 8% 10%`,
        '--sidebar-foreground': `${ph} 5% 70%`,
        '--sidebar-primary': toHsl(primaryHex),
        '--sidebar-primary-foreground': '0 0% 98%',
        '--sidebar-accent': `${ph} 8% 15%`,
        '--sidebar-accent-foreground': `${ph} 5% 70%`,
        '--chart-1': `${ph} 58% 44%`,
        '--chart-5': `${ph} 61% 44%`,
      }
    : {
        '--primary': toHsl(primaryHex),
        '--primary-foreground': '0 0% 100%',
        '--ring': toHsl(primaryHex),
        '--background': `${ph} 20% 97%`,
        '--card': `${ph} 20% 97%`,
        '--card-foreground': `${ph} 17% 10%`,
        '--popover': '0 0% 100%',
        '--popover-foreground': `${ph} 18% 13%`,
        '--muted': `${ph} 20% 90%`,
        '--muted-foreground': `${ph} 2% 50%`,
        '--accent': `${ph} 16% 88%`,
        '--accent-foreground': `${ph} 18% 13%`,
        '--border': `${ph} 4% 84%`,
        '--input': `${ph} 5% 68%`,
        '--sidebar': `${ph} 13% 95%`,
        '--sidebar-foreground': `${ph} 3% 24%`,
        '--sidebar-primary': toHsl(primaryHex),
        '--sidebar-primary-foreground': '0 0% 98%',
        '--sidebar-accent': `${ph} 16% 88%`,
        '--sidebar-accent-foreground': '0 0% 20%',
        '--chart-1': `${ph} 58% 44%`,
        '--chart-5': `${ph} 61% 44%`,
      }

  if (secondaryHex) {
    vars['--secondary'] = toHsl(secondaryHex)
    vars['--secondary-foreground'] = '0 0% 100%'
  }

  return vars
}

export function ThemeInjector({ primaryColor, secondaryColor }: ThemeInjectorProps) {
  useEffect(() => {
    const lightVars = buildCssVars(primaryColor, secondaryColor ?? null, false)
    const darkVars = buildCssVars(primaryColor, secondaryColor ?? null, true)

    // Build CSS rules that respect the .dark selector
    const lightRules = Object.entries(lightVars)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join('\n')
    const darkRules = Object.entries(darkVars)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join('\n')

    const style = document.createElement('style')
    style.id = 'theme-injector'
    style.textContent = `:root {\n${lightRules}\n}\n.dark {\n${darkRules}\n}`

    // Remove previous injection if any
    document.getElementById('theme-injector')?.remove()
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [primaryColor, secondaryColor])

  return null
}
