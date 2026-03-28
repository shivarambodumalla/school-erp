import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const schemaPath = path.resolve(__dirname, '../../../../prisma/schema.prisma')
const schema = fs.readFileSync(schemaPath, 'utf-8')

describe('Staff Module Schema Validation', () => {
  // ── Models exist ──
  const requiredModels = [
    'Department',
    'StaffRole',
    'Staff',
    'StaffRoleAssignment',
    'ClassTeacherAssignment',
    'StaffLeaveType',
    'StaffLeave',
    'StaffAttendance',
    'StaffSalaryConfig',
    'StaffSalary',
    'StaffDocument',
    'PerformanceNote',
    'StaffIdCard',
    'StaffSettings',
  ]

  for (const model of requiredModels) {
    it(`should have model ${model}`, () => {
      expect(schema).toContain(`model ${model} {`)
    })
  }

  // ── Enums exist ──
  const requiredEnums = ['StaffStatus', 'LeaveStatus', 'StaffAttendanceStatus']

  for (const e of requiredEnums) {
    it(`should have enum ${e}`, () => {
      expect(schema).toContain(`enum ${e} {`)
    })
  }

  // ── StaffStatus values ──
  it('StaffStatus should have all expected values', () => {
    const statusBlock = schema.match(/enum StaffStatus \{[\s\S]*?\}/)?.[0] ?? ''
    expect(statusBlock).toContain('ACTIVE')
    expect(statusBlock).toContain('INACTIVE')
    expect(statusBlock).toContain('ON_LEAVE')
    expect(statusBlock).toContain('TERMINATED')
  })

  // ── LeaveStatus values ──
  it('LeaveStatus should have all expected values', () => {
    const block = schema.match(/enum LeaveStatus \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('PENDING')
    expect(block).toContain('APPROVED')
    expect(block).toContain('REJECTED')
    expect(block).toContain('CANCELLED')
  })

  // ── StaffAttendanceStatus values ──
  it('StaffAttendanceStatus should have all expected values', () => {
    const block = schema.match(/enum StaffAttendanceStatus \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('PRESENT')
    expect(block).toContain('ABSENT')
    expect(block).toContain('HALF_DAY')
    expect(block).toContain('ON_LEAVE')
    expect(block).toContain('HOLIDAY')
    expect(block).toContain('LATE')
  })

  // ── Multi-tenant: institutionId on all tenant models ──
  const tenantModels = [
    'Department',
    'StaffRole',
    'Staff',
    'ClassTeacherAssignment',
    'StaffLeaveType',
    'StaffLeave',
    'StaffAttendance',
    'StaffSalaryConfig',
    'StaffSalary',
    'StaffDocument',
    'PerformanceNote',
    'StaffSettings',
  ]

  for (const model of tenantModels) {
    it(`${model} should have institutionId field`, () => {
      const block = schema.match(new RegExp(`model ${model} \\{[\\s\\S]*?\\}`))?.[0] ?? ''
      expect(block).toContain('institutionId')
    })
  }

  // ── Key unique constraints ──
  it('Department should have unique constraint on [institutionId, name]', () => {
    const block = schema.match(/model Department \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('@@unique([institutionId, name])')
  })

  it('StaffRole should have unique constraint on [institutionId, name]', () => {
    const block = schema.match(/model StaffRole \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('@@unique([institutionId, name])')
  })

  it('Staff should have unique constraint on [institutionId, employeeNo]', () => {
    const block = schema.match(/model Staff \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('@@unique([institutionId, employeeNo])')
  })

  it('StaffAttendance should have unique constraint on [staffId, date]', () => {
    const block = schema.match(/model StaffAttendance \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('@@unique([staffId, date])')
  })

  it('StaffSalary should have unique constraint on [staffId, month, year]', () => {
    const block = schema.match(/model StaffSalary \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('@@unique([staffId, month, year])')
  })

  // ── Staff should have userId as optional unique ──
  it('Staff should have optional unique userId', () => {
    const block = schema.match(/model Staff \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toMatch(/userId\s+String\?\s+@unique/)
  })

  // ── Institution should have staff module relations ──
  it('Institution should have staff module relations', () => {
    const block = schema.match(/model Institution \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('departments')
    expect(block).toContain('staffRoles')
    expect(block).toContain('staff ')
    expect(block).toContain('staffSettings')
    expect(block).toContain('staffSalaryConfig')
  })

  // ── User should have staff relation ──
  it('User should have staff relation', () => {
    const block = schema.match(/model User \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('staff')
  })

  // ── SubjectTeacher should have optional staffId ──
  it('SubjectTeacher should have optional staffId', () => {
    const block = schema.match(/model SubjectTeacher \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('staffId')
  })

  // ── SubstitutionRecord should have staff relations ──
  it('SubstitutionRecord should have staff relations', () => {
    const block = schema.match(/model SubstitutionRecord \{[\s\S]*?\}/)?.[0] ?? ''
    expect(block).toContain('originalStaffId')
    expect(block).toContain('substituteStaffId')
    expect(block).toContain('OriginalTeacher')
    expect(block).toContain('SubstituteTeacher')
  })
})
