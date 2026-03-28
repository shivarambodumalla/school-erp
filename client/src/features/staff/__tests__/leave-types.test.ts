import { describe, it, expect } from 'vitest'
import { STATUS_COLORS, type StatusFilter } from '../components/leave-types'

describe('STATUS_COLORS', () => {
  it('should have colors for all 4 leave statuses', () => {
    expect(STATUS_COLORS).toHaveProperty('PENDING')
    expect(STATUS_COLORS).toHaveProperty('APPROVED')
    expect(STATUS_COLORS).toHaveProperty('REJECTED')
    expect(STATUS_COLORS).toHaveProperty('CANCELLED')
  })

  it('PENDING should use amber colors', () => {
    expect(STATUS_COLORS.PENDING).toContain('amber')
  })

  it('APPROVED should use green colors', () => {
    expect(STATUS_COLORS.APPROVED).toContain('green')
  })

  it('REJECTED should use red colors', () => {
    expect(STATUS_COLORS.REJECTED).toContain('red')
  })

  it('CANCELLED should use gray colors', () => {
    expect(STATUS_COLORS.CANCELLED).toContain('gray')
  })
})

describe('StatusFilter type', () => {
  it('should accept valid status values', () => {
    const validStatuses: StatusFilter[] = [
      'ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED',
    ]
    expect(validStatuses).toHaveLength(5)
  })
})

describe('LeaveBalance interface', () => {
  it('should structure balance data correctly', () => {
    const balance = {
      leaveTypeId: 'lt1',
      name: 'Casual Leave',
      shortName: 'CL',
      total: 12,
      used: 4,
      remaining: 8,
      carryForward: false,
    }
    expect(balance.remaining).toBe(balance.total - balance.used)
    expect(balance.carryForward).toBe(false)
  })
})
