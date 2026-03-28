/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, CreditCard,
  Bell, ChevronRight, TrendingUp, BookOpen,
} from 'lucide-react'
import type { ThemePalette } from '@/lib/colorUtils'

type PreviewMode = 'desktop' | 'mobile' | 'email'

interface Props {
  palette: ThemePalette
  institutionName: string
  logoUrl: string
  isDark: boolean
}

export function ThemePreview({
  palette, institutionName, logoUrl, isDark: _isDark,
}: Props) {
  const [mode, setMode] = useState<PreviewMode>('desktop')

  const p = palette.primary
  const bg = palette.background
  const surface = palette.surface
  const border = palette.border
  const text = palette.textPrimary
  const muted = palette.textMuted

  const initials = institutionName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Students', active: false },
    { icon: CreditCard, label: 'Fees', active: false },
    { icon: BookOpen, label: 'Courses', active: false },
  ]

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Live Preview</h3>
        <div className="flex rounded-lg border overflow-hidden shrink-0">
          {(['desktop', 'mobile', 'email'] as PreviewMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1.5 text-xs font-medium capitalize
                transition-colors
                ${mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP PREVIEW */}
      {mode === 'desktop' && (
        <div
          className="rounded-lg overflow-hidden border"
          style={{ backgroundColor: bg, borderColor: border }}
        >
          <div className="flex h-52">
            {/* Mini sidebar */}
            <div
              className="w-28 flex flex-col shrink-0"
              style={{
                backgroundColor: surface,
                borderRight: `1px solid ${border}`,
              }}
            >
              <div
                className="p-2.5 flex items-center gap-2 border-b"
                style={{ borderColor: border }}
              >
                <div
                  className="h-6 w-6 rounded flex items-center
                    justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: p[500] }}
                >
                  {initials.slice(0, 1)}
                </div>
                <div
                  className="h-2 w-12 rounded"
                  style={{ backgroundColor: text, opacity: 0.7 }}
                />
              </div>
              <div className="flex-1 p-1.5 space-y-0.5">
                {NAV_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded"
                    style={{
                      backgroundColor: item.active ? p[500] : 'transparent',
                      color: item.active ? '#fff' : muted,
                    }}
                  >
                    <item.icon style={{ width: 11, height: 11 }} />
                    <span style={{ fontSize: 9 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div
              className="flex-1 p-3 space-y-2.5 overflow-hidden"
              style={{ backgroundColor: bg }}
            >
              <div
                className="h-3 w-24 rounded"
                style={{ backgroundColor: text, opacity: 0.8 }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Students', 'Fees', 'Staff'].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-2"
                    style={{
                      backgroundColor: surface,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div
                      className="h-4 w-4 rounded mb-1.5"
                      style={{ backgroundColor: p[500], opacity: 0.2 }}
                    />
                    <div
                      className="h-3 w-10 rounded mb-1"
                      style={{ backgroundColor: text, opacity: 0.8 }}
                    />
                    <div
                      className="h-2 w-8 rounded"
                      style={{ backgroundColor: muted, opacity: 0.5 }}
                    />
                  </div>
                ))}
              </div>
              <div
                className="inline-flex items-center gap-1 px-2.5 py-1.5
                  rounded-md text-white"
                style={{
                  backgroundColor: p[500],
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                <TrendingUp style={{ width: 9, height: 9 }} />
                View Report
              </div>
              <div
                className="rounded-lg p-2 space-y-1.5"
                style={{
                  backgroundColor: surface,
                  border: `1px solid ${border}`,
                }}
              >
                <div
                  className="h-1.5 w-full rounded"
                  style={{ backgroundColor: muted, opacity: 0.15 }}
                />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: p[200] }}
                    />
                    <div
                      className="h-1.5 flex-1 rounded"
                      style={{ backgroundColor: muted, opacity: 0.3 }}
                    />
                    <div
                      className="h-1.5 w-10 rounded"
                      style={{ backgroundColor: muted, opacity: 0.3 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PREVIEW */}
      {mode === 'mobile' && (
        <div className="flex justify-center py-2">
          <div
            className="w-52 rounded-3xl overflow-hidden shadow-2xl"
            style={{ border: '6px solid #1f2937' }}
          >
            <div
              className="flex items-center justify-between px-4 py-1.5"
              style={{ backgroundColor: p[700] }}
            >
              <span style={{ fontSize: 8, color: '#fff' }}>9:41</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 4, height: 4,
                      backgroundColor: '#fff',
                      opacity: i === 3 ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                backgroundColor: surface,
                borderBottom: `1px solid ${border}`,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: text }}>
                Dashboard
              </span>
              <Bell style={{ width: 11, height: 11, color: muted }} />
            </div>
            <div className="p-3 space-y-2.5" style={{ backgroundColor: bg }}>
              <div className="rounded-xl p-3" style={{ backgroundColor: p[500] }}>
                <div
                  className="h-2.5 w-24 rounded mb-1.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <div
                  className="h-2 w-16 rounded"
                  style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="rounded-lg p-2"
                    style={{
                      backgroundColor: surface,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div
                      className="h-3 w-3 rounded mb-1.5"
                      style={{ backgroundColor: p[500], opacity: 0.3 }}
                    />
                    <div
                      className="h-2.5 w-8 rounded"
                      style={{ backgroundColor: text, opacity: 0.7 }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex border-t"
              style={{ backgroundColor: surface, borderColor: border }}
            >
              {[LayoutDashboard, Users, CreditCard, Bell].map((Icon, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center py-2 gap-0.5"
                  style={{ color: i === 0 ? p[500] : muted }}
                >
                  <Icon style={{ width: 12, height: 12 }} />
                  <div
                    className="rounded-full"
                    style={{
                      width: 3, height: 3,
                      backgroundColor: i === 0 ? p[500] : 'transparent',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW */}
      {mode === 'email' && (
        <div
          className="rounded-lg overflow-hidden border"
          style={{ borderColor: border }}
        >
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{ backgroundColor: p[600] }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={institutionName}
                className="h-8 w-8 rounded object-contain"
              />
            ) : (
              <div
                className="h-8 w-8 rounded flex items-center
                  justify-center text-white font-bold"
                style={{ backgroundColor: p[700], fontSize: 12 }}
              >
                {initials.slice(0, 1)}
              </div>
            )}
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {institutionName}
            </span>
          </div>
          <div className="px-5 py-4 space-y-3" style={{ backgroundColor: bg }}>
            <div
              className="h-4 w-40 rounded"
              style={{ backgroundColor: text, opacity: 0.85 }}
            />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-2 rounded"
                  style={{
                    backgroundColor: muted,
                    opacity: 0.5,
                    width: i === 3 ? '60%' : '100%',
                  }}
                />
              ))}
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-4 py-2
                rounded-lg text-white"
              style={{
                backgroundColor: p[500],
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              View Details
              <ChevronRight style={{ width: 11, height: 11 }} />
            </div>
          </div>
          <div
            className="px-5 py-3 text-center border-t"
            style={{
              backgroundColor: surface,
              borderColor: border,
              color: muted,
              fontSize: 10,
            }}
          >
            {institutionName} · Powered by Platform ·{' '}
            <span style={{ textDecoration: 'underline' }}>Unsubscribe</span>
          </div>
        </div>
      )}
    </div>
  )
}
