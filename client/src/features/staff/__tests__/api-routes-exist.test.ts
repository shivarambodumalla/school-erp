import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const apiBase = path.resolve(__dirname, '../../../app/api/school')

function routeExists(routePath: string): boolean {
  const fullPath = path.join(apiBase, routePath, 'route.ts')
  return fs.existsSync(fullPath)
}

describe('Staff API Routes — file existence', () => {
  // ── Settings ──
  it('GET/PATCH /api/school/settings/staff', () => {
    expect(routeExists('settings/staff')).toBe(true)
  })

  it('GET/POST /api/school/settings/departments', () => {
    expect(routeExists('settings/departments')).toBe(true)
  })

  it('PATCH/DELETE /api/school/settings/departments/[id]', () => {
    expect(routeExists('settings/departments/[id]')).toBe(true)
  })

  it('GET/POST /api/school/settings/leave-types', () => {
    expect(routeExists('settings/leave-types')).toBe(true)
  })

  it('PATCH/DELETE /api/school/settings/leave-types/[id]', () => {
    expect(routeExists('settings/leave-types/[id]')).toBe(true)
  })

  it('GET/PATCH /api/school/settings/salary-config', () => {
    expect(routeExists('settings/salary-config')).toBe(true)
  })

  // ── Staff Roles ──
  it('GET/POST /api/school/staff-roles', () => {
    expect(routeExists('staff-roles')).toBe(true)
  })

  it('GET/PATCH/DELETE /api/school/staff-roles/[roleId]', () => {
    expect(routeExists('staff-roles/[roleId]')).toBe(true)
  })

  // ── Staff CRUD ──
  it('GET/POST /api/school/staff', () => {
    expect(routeExists('staff')).toBe(true)
  })

  it('GET/PATCH /api/school/staff/[staffId]', () => {
    expect(routeExists('staff/[staffId]')).toBe(true)
  })

  it('POST/DELETE /api/school/staff/[staffId]/secondary-roles', () => {
    expect(routeExists('staff/[staffId]/secondary-roles')).toBe(true)
  })

  // ── Staff Documents ──
  it('GET/POST /api/school/staff/[staffId]/documents', () => {
    expect(routeExists('staff/[staffId]/documents')).toBe(true)
  })

  it('PATCH/DELETE /api/school/staff/[staffId]/documents/[docId]', () => {
    expect(routeExists('staff/[staffId]/documents/[docId]')).toBe(true)
  })

  // ── Performance Notes ──
  it('GET/POST /api/school/staff/[staffId]/performance-notes', () => {
    expect(routeExists('staff/[staffId]/performance-notes')).toBe(true)
  })

  // ── ID Card ──
  it('GET/POST /api/school/staff/[staffId]/id-card', () => {
    expect(routeExists('staff/[staffId]/id-card')).toBe(true)
  })

  // ── Leave ──
  it('GET/POST /api/school/staff/[staffId]/leaves', () => {
    expect(routeExists('staff/[staffId]/leaves')).toBe(true)
  })

  it('PATCH /api/school/staff/[staffId]/leaves/[leaveId]', () => {
    expect(routeExists('staff/[staffId]/leaves/[leaveId]')).toBe(true)
  })

  it('GET /api/school/staff/leaves (admin all)', () => {
    expect(routeExists('staff/leaves')).toBe(true)
  })

  it('GET /api/school/staff/leaves/balance', () => {
    expect(routeExists('staff/leaves/balance')).toBe(true)
  })

  // ── Attendance ──
  it('GET/POST /api/school/staff/attendance', () => {
    expect(routeExists('staff/attendance')).toBe(true)
  })

  it('GET /api/school/staff/[staffId]/attendance', () => {
    expect(routeExists('staff/[staffId]/attendance')).toBe(true)
  })

  it('POST/PATCH /api/school/staff/checkin', () => {
    expect(routeExists('staff/checkin')).toBe(true)
  })

  // ── Payroll ──
  it('GET/POST /api/school/staff/payroll', () => {
    expect(routeExists('staff/payroll')).toBe(true)
  })

  it('GET /api/school/staff/[staffId]/payroll', () => {
    expect(routeExists('staff/[staffId]/payroll')).toBe(true)
  })
})

describe('Staff Pages — file existence', () => {
  const pagesBase = path.resolve(__dirname, '../../../app/management/staff')

  function pageExists(pagePath: string): boolean {
    return fs.existsSync(path.join(pagesBase, pagePath, 'page.tsx'))
  }

  it('/management/staff (list page)', () => {
    expect(pageExists('')).toBe(true)
  })

  it('/management/staff/[staffId] (profile page)', () => {
    expect(pageExists('[staffId]')).toBe(true)
  })

  it('/management/staff/[staffId]/id-card', () => {
    expect(pageExists('[staffId]/id-card')).toBe(true)
  })

  it('/management/staff/roles', () => {
    expect(pageExists('roles')).toBe(true)
  })

  it('/management/staff/leaves', () => {
    expect(pageExists('leaves')).toBe(true)
  })

  it('/management/staff/payroll', () => {
    expect(pageExists('payroll')).toBe(true)
  })

  it('/management/staff/org-chart', () => {
    expect(pageExists('org-chart')).toBe(true)
  })
})

describe('Staff API routes — auth guard pattern', () => {
  const routeFiles = [
    'settings/staff/route.ts',
    'settings/departments/route.ts',
    'staff-roles/route.ts',
    'staff/route.ts',
    'staff/attendance/route.ts',
    'staff/payroll/route.ts',
    'staff/leaves/route.ts',
  ]

  for (const file of routeFiles) {
    it(`${file} should import auth from @/server/auth`, () => {
      const content = fs.readFileSync(path.join(apiBase, file), 'utf-8')
      expect(content).toContain("from '@/server/auth'")
    })

    it(`${file} should check session exists`, () => {
      const content = fs.readFileSync(path.join(apiBase, file), 'utf-8')
      expect(content).toMatch(/!session/)
    })

    it(`${file} should use institutionId`, () => {
      const content = fs.readFileSync(path.join(apiBase, file), 'utf-8')
      expect(content).toContain('institutionId')
    })
  }
})
