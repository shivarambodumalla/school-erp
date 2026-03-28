import { describe, it, expect } from 'vitest'
import {
  FEATURE_GROUPS,
  ALL_FEATURES,
  getDefaultPermissions,
  summarizePermissions,
  type Permission,
} from '../types'

describe('FEATURE_GROUPS', () => {
  it('should have 9 feature groups', () => {
    expect(Object.keys(FEATURE_GROUPS)).toHaveLength(9)
  })

  it('should contain expected group keys', () => {
    const keys = Object.keys(FEATURE_GROUPS)
    expect(keys).toContain('ACADEMIC')
    expect(keys).toContain('STUDENTS')
    expect(keys).toContain('ADMISSIONS')
    expect(keys).toContain('COMMUNICATION')
    expect(keys).toContain('FINANCE')
    expect(keys).toContain('STAFF')
    expect(keys).toContain('CONTENT')
    expect(keys).toContain('REPORTS')
    expect(keys).toContain('ADMIN')
  })

  it('each group should have a label and features array', () => {
    for (const group of Object.values(FEATURE_GROUPS)) {
      expect(group.label).toBeDefined()
      expect(group.label.length).toBeGreaterThan(0)
      expect(Array.isArray(group.features)).toBe(true)
      expect(group.features.length).toBeGreaterThan(0)
    }
  })

  it('each feature should have key and label', () => {
    for (const group of Object.values(FEATURE_GROUPS)) {
      for (const feature of group.features) {
        expect(feature.key).toBeDefined()
        expect(feature.label).toBeDefined()
        expect(feature.key.length).toBeGreaterThan(0)
        expect(feature.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('feature keys should be unique across all groups', () => {
    const keys = ALL_FEATURES.map((f) => f.key)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })
})

describe('ALL_FEATURES', () => {
  it('should have 27 total features', () => {
    expect(ALL_FEATURES).toHaveLength(27)
  })

  it('should include expected features', () => {
    const keys = ALL_FEATURES.map((f) => f.key)
    expect(keys).toContain('classes')
    expect(keys).toContain('attendance')
    expect(keys).toContain('fees')
    expect(keys).toContain('payroll')
    expect(keys).toContain('audit_log')
  })
})

describe('getDefaultPermissions', () => {
  it('should return permissions for all 27 features', () => {
    const perms = getDefaultPermissions()
    expect(perms).toHaveLength(27)
  })

  it('all default permissions should be NONE access with ALL scope', () => {
    const perms = getDefaultPermissions()
    for (const p of perms) {
      expect(p.access).toBe('NONE')
      expect(p.scope).toBe('ALL')
    }
  })

  it('should have feature key for each permission', () => {
    const perms = getDefaultPermissions()
    for (const p of perms) {
      expect(p.feature).toBeDefined()
      expect(p.feature.length).toBeGreaterThan(0)
    }
  })

  it('should return a new array each time (no shared reference)', () => {
    const a = getDefaultPermissions()
    const b = getDefaultPermissions()
    expect(a).not.toBe(b)
    a[0].access = 'FULL'
    expect(b[0].access).toBe('NONE')
  })
})

describe('summarizePermissions', () => {
  it('should count access levels correctly', () => {
    const perms: Permission[] = [
      { feature: 'classes', access: 'FULL', scope: 'ALL' },
      { feature: 'timetable', access: 'FULL', scope: 'ALL' },
      { feature: 'subjects', access: 'EDIT', scope: 'ALL' },
      { feature: 'attendance', access: 'VIEW', scope: 'OWN' },
      { feature: 'grades', access: 'NONE', scope: 'ALL' },
    ]
    const summary = summarizePermissions(perms)
    expect(summary.full).toBe(2)
    expect(summary.edit).toBe(1)
    expect(summary.view).toBe(1)
    expect(summary.none).toBe(1)
  })

  it('should handle empty array', () => {
    const summary = summarizePermissions([])
    expect(summary.full).toBe(0)
    expect(summary.edit).toBe(0)
    expect(summary.view).toBe(0)
    expect(summary.none).toBe(0)
  })

  it('should handle all same access level', () => {
    const perms: Permission[] = [
      { feature: 'a', access: 'VIEW', scope: 'ALL' },
      { feature: 'b', access: 'VIEW', scope: 'ALL' },
      { feature: 'c', access: 'VIEW', scope: 'ALL' },
    ]
    const summary = summarizePermissions(perms)
    expect(summary.view).toBe(3)
    expect(summary.full).toBe(0)
    expect(summary.edit).toBe(0)
    expect(summary.none).toBe(0)
  })

  it('should summarize full default permissions as all NONE', () => {
    const perms = getDefaultPermissions()
    const summary = summarizePermissions(perms)
    expect(summary.none).toBe(27)
    expect(summary.full).toBe(0)
    expect(summary.edit).toBe(0)
    expect(summary.view).toBe(0)
  })
})
