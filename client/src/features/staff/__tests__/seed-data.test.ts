import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const seedPath = path.resolve(__dirname, '../../../../prisma/seed.ts')
const seed = fs.readFileSync(seedPath, 'utf-8')

describe('Seed File — Staff Module Data', () => {
  it('should seed StaffSettings', () => {
    expect(seed).toContain('prisma.staffSettings.upsert')
    expect(seed).toContain("employeeNoPrefix: 'EMP'")
  })

  it('should seed StaffSalaryConfig', () => {
    expect(seed).toContain('prisma.staffSalaryConfig.upsert')
    expect(seed).toContain('allowanceTypes')
    expect(seed).toContain('deductionTypes')
  })

  it('should seed 5 leave types', () => {
    expect(seed).toContain('Casual Leave')
    expect(seed).toContain('Sick Leave')
    expect(seed).toContain('Earned Leave')
    expect(seed).toContain('Maternity Leave')
    expect(seed).toContain('Loss of Pay')
  })

  it('should seed 6 staff roles', () => {
    expect(seed).toContain("name: 'Principal'")
    expect(seed).toContain("name: 'Vice Principal'")
    expect(seed).toContain("name: 'Head of Department'")
    expect(seed).toContain("name: 'Class Teacher'")
    expect(seed).toContain("name: 'Subject Teacher'")
    expect(seed).toContain("name: 'Admin Staff'")
  })

  it('should seed 6 departments', () => {
    expect(seed).toContain('Science Department')
    expect(seed).toContain('Mathematics Department')
    expect(seed).toContain('Languages Department')
    expect(seed).toContain('Social Studies Department')
    expect(seed).toContain('Arts & Sports Department')
    expect(seed).toContain('Administration')
  })

  it('should create 3 staff records from teachers', () => {
    expect(seed).toContain("employeeNo: 'EMP1001'")
    expect(seed).toContain("employeeNo: 'EMP1002'")
    expect(seed).toContain("employeeNo: 'EMP1003'")
  })

  it('should set HOD for Science department', () => {
    expect(seed).toContain('hodId: staff1.id')
  })

  it('should clean up staff tables before seeding', () => {
    expect(seed).toContain('prisma.staffIdCard.deleteMany()')
    expect(seed).toContain('prisma.performanceNote.deleteMany()')
    expect(seed).toContain('prisma.staffDocument.deleteMany()')
    expect(seed).toContain('prisma.staffSalary.deleteMany()')
    expect(seed).toContain('prisma.staffAttendance.deleteMany()')
    expect(seed).toContain('prisma.staffLeave.deleteMany()')
    expect(seed).toContain('prisma.staff.deleteMany()')
    expect(seed).toContain('prisma.staffRole.deleteMany()')
    expect(seed).toContain('prisma.department.deleteMany()')
  })

  it('staff roles should have permissions with feature/access/scope', () => {
    expect(seed).toContain("feature: 'classes'")
    expect(seed).toContain("access: 'FULL'")
    expect(seed).toContain("scope: 'INSTITUTION'")
    expect(seed).toContain("scope: 'DEPARTMENT'")
    expect(seed).toContain("scope: 'OWN'")
  })

  it('system roles should be marked isSystemRole: true', () => {
    expect(seed).toContain('isSystemRole: true')
    expect(seed).toContain('isSystemRole: role.isSystemRole')
  })
})
