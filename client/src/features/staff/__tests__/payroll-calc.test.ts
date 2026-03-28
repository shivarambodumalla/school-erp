import { describe, it, expect } from 'vitest'

// Payroll calculation logic (mirrors what the API route does)
function calculatePayroll(input: {
  basicSalary: number
  allowances: { name: string; amount: number }[]
  deductions: { name: string; amount: number }[]
  lopDays: number
}) {
  const { basicSalary, allowances, deductions, lopDays } = input
  const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0)
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0)
  const lopDeduction = lopDays > 0 ? (basicSalary / 30) * lopDays : 0
  const grossSalary = basicSalary + totalAllowances
  const netSalary = grossSalary - totalDeductions - lopDeduction

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    lopDeduction: Math.round(lopDeduction * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  }
}

describe('Payroll Calculations', () => {
  it('calculates basic payroll with no LOP', () => {
    const result = calculatePayroll({
      basicSalary: 50000,
      allowances: [
        { name: 'HRA', amount: 10000 },
        { name: 'Transport', amount: 3000 },
      ],
      deductions: [
        { name: 'PF', amount: 6000 },
        { name: 'Tax', amount: 200 },
      ],
      lopDays: 0,
    })

    expect(result.grossSalary).toBe(63000)
    expect(result.lopDeduction).toBe(0)
    expect(result.netSalary).toBe(56800)
  })

  it('calculates LOP deduction correctly', () => {
    const result = calculatePayroll({
      basicSalary: 30000,
      allowances: [],
      deductions: [],
      lopDays: 3,
    })

    expect(result.lopDeduction).toBe(3000) // 30000/30 * 3
    expect(result.grossSalary).toBe(30000)
    expect(result.netSalary).toBe(27000)
  })

  it('handles zero basic salary', () => {
    const result = calculatePayroll({
      basicSalary: 0,
      allowances: [],
      deductions: [],
      lopDays: 0,
    })

    expect(result.grossSalary).toBe(0)
    expect(result.lopDeduction).toBe(0)
    expect(result.netSalary).toBe(0)
  })

  it('handles multiple allowances and deductions', () => {
    const result = calculatePayroll({
      basicSalary: 40000,
      allowances: [
        { name: 'HRA', amount: 8000 },
        { name: 'Transport', amount: 2000 },
        { name: 'Medical', amount: 1500 },
      ],
      deductions: [
        { name: 'PF', amount: 4800 },
        { name: 'Professional Tax', amount: 200 },
        { name: 'Income Tax', amount: 2000 },
      ],
      lopDays: 2,
    })

    expect(result.grossSalary).toBe(51500)
    expect(result.lopDeduction).toBeCloseTo(2666.67, 1)
    expect(result.netSalary).toBeCloseTo(41833.33, 1)
  })

  it('net salary can be negative with heavy deductions', () => {
    const result = calculatePayroll({
      basicSalary: 10000,
      allowances: [],
      deductions: [{ name: 'Large Deduction', amount: 15000 }],
      lopDays: 0,
    })

    expect(result.netSalary).toBe(-5000)
  })

  it('handles 30 LOP days (full month absent)', () => {
    const result = calculatePayroll({
      basicSalary: 30000,
      allowances: [{ name: 'HRA', amount: 6000 }],
      deductions: [],
      lopDays: 30,
    })

    expect(result.lopDeduction).toBe(30000) // Full basic deducted
    expect(result.grossSalary).toBe(36000)
    expect(result.netSalary).toBe(6000) // Only allowances remain
  })
})

// Leave days calculation (excludes Sundays)
function calculateLeaveDays(fromDate: string, toDate: string): number {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  let count = 0
  const current = new Date(from)
  while (current <= to) {
    if (current.getDay() !== 0) count++ // 0 = Sunday
    current.setDate(current.getDate() + 1)
  }
  return count
}

describe('Leave Days Calculation', () => {
  it('calculates weekdays in a single week', () => {
    // Mon to Fri
    const days = calculateLeaveDays('2024-03-25', '2024-03-29')
    expect(days).toBe(5)
  })

  it('excludes Sundays', () => {
    // Mon to Sun (7 days but only 6 weekdays)
    const days = calculateLeaveDays('2024-03-25', '2024-03-31')
    expect(days).toBe(6)
  })

  it('handles single day leave', () => {
    const days = calculateLeaveDays('2024-03-25', '2024-03-25')
    expect(days).toBe(1)
  })

  it('Sunday-only leave counts as 0', () => {
    const days = calculateLeaveDays('2024-03-31', '2024-03-31')
    expect(days).toBe(0)
  })

  it('two full weeks = 12 weekdays', () => {
    // Mon to next Fri (14 days, 2 Sundays)
    const days = calculateLeaveDays('2024-03-18', '2024-03-31')
    expect(days).toBe(12)
  })
})
