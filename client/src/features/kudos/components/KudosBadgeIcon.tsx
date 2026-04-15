'use client'

const BADGE_CONFIG: Record<string, { emoji: string; bg: string; label: string }> = {
  STAR: { emoji: '\u2B50', bg: 'bg-amber-100', label: 'Star' },
  THUMBS_UP: { emoji: '\uD83D\uDC4D', bg: 'bg-blue-100', label: 'Thumbs Up' },
  TROPHY: { emoji: '\uD83C\uDFC6', bg: 'bg-yellow-100', label: 'Trophy' },
  HEART: { emoji: '\u2764\uFE0F', bg: 'bg-red-100', label: 'Heart' },
  LIGHTNING: { emoji: '\u26A1', bg: 'bg-purple-100', label: 'Lightning' },
  CROWN: { emoji: '\uD83D\uDC51', bg: 'bg-emerald-100', label: 'Crown' },
}

interface Props {
  badge: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function KudosBadgeIcon({ badge, size = 'md', showLabel = false }: Props) {
  const config = BADGE_CONFIG[badge] ?? BADGE_CONFIG.STAR

  const sizeClasses = {
    sm: 'h-7 w-7 text-sm',
    md: 'h-9 w-9 text-lg',
    lg: 'h-12 w-12 text-2xl',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} ${config.bg} rounded-full flex items-center justify-center shrink-0`}
        title={config.label}
      >
        <span role="img" aria-label={config.label}>{config.emoji}</span>
      </div>
      {showLabel && (
        <span className="text-[10px] text-muted-foreground font-medium">{config.label}</span>
      )}
    </div>
  )
}

export function getBadgeEmoji(badge: string): string {
  return BADGE_CONFIG[badge]?.emoji ?? '\u2B50'
}

export function getBadgeLabel(badge: string): string {
  return BADGE_CONFIG[badge]?.label ?? 'Star'
}

export const ALL_BADGES = Object.keys(BADGE_CONFIG)

export function getBadgePoints(badge: string): number {
  const points: Record<string, number> = {
    STAR: 10,
    THUMBS_UP: 5,
    TROPHY: 25,
    HEART: 10,
    LIGHTNING: 15,
    CROWN: 50,
  }
  return points[badge] ?? 5
}
