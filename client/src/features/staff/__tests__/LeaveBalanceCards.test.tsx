import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LeaveBalanceCards } from '../components/LeaveBalanceCards'
import type { LeaveBalance } from '../components/leave-types'

function makeBalance(overrides: Partial<LeaveBalance> = {}): LeaveBalance {
  return {
    leaveTypeId: 'lt1',
    name: 'Casual Leave',
    shortName: 'CL',
    total: 12,
    used: 4,
    remaining: 8,
    carryForward: false,
    ...overrides,
  }
}

describe('LeaveBalanceCards', () => {
  it('renders empty state when no balances', () => {
    render(<LeaveBalanceCards balances={[]} />)
    expect(screen.getByText(/no leave types configured/i)).toBeInTheDocument()
  })

  it('renders leave type name and short name', () => {
    render(<LeaveBalanceCards balances={[makeBalance()]} />)
    expect(screen.getByText('Casual Leave')).toBeInTheDocument()
    expect(screen.getByText('CL')).toBeInTheDocument()
  })

  it('displays remaining and total counts', () => {
    render(<LeaveBalanceCards balances={[makeBalance()]} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('/12')).toBeInTheDocument()
  })

  it('shows used count', () => {
    render(<LeaveBalanceCards balances={[makeBalance()]} />)
    expect(screen.getByText('Used: 4')).toBeInTheDocument()
  })

  it('shows carry forward label when applicable', () => {
    render(<LeaveBalanceCards balances={[makeBalance({ carryForward: true })]} />)
    expect(screen.getByText('Carry forward')).toBeInTheDocument()
  })

  it('does not show carry forward when false', () => {
    render(<LeaveBalanceCards balances={[makeBalance({ carryForward: false })]} />)
    expect(screen.queryByText('Carry forward')).not.toBeInTheDocument()
  })

  it('renders multiple balance cards', () => {
    const balances = [
      makeBalance({ leaveTypeId: '1', name: 'Casual Leave', shortName: 'CL' }),
      makeBalance({ leaveTypeId: '2', name: 'Sick Leave', shortName: 'SL' }),
      makeBalance({ leaveTypeId: '3', name: 'Earned Leave', shortName: 'EL' }),
    ]
    render(<LeaveBalanceCards balances={balances} />)
    expect(screen.getByText('Casual Leave')).toBeInTheDocument()
    expect(screen.getByText('Sick Leave')).toBeInTheDocument()
    expect(screen.getByText('Earned Leave')).toBeInTheDocument()
  })

  it('handles zero total gracefully', () => {
    render(<LeaveBalanceCards balances={[makeBalance({ total: 0, used: 0, remaining: 0 })]} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('/0')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    const { container } = render(
      <LeaveBalanceCards balances={[makeBalance({ total: 10, used: 5, remaining: 5 })]} />
    )
    const progressBar = container.querySelector('[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '50%' })
  })

  it('uses red color when usage is at 90%+', () => {
    const { container } = render(
      <LeaveBalanceCards balances={[makeBalance({ total: 10, used: 9, remaining: 1 })]} />
    )
    const bar = container.querySelector('.bg-red-500')
    expect(bar).toBeInTheDocument()
  })

  it('uses amber color when usage is 70-89%', () => {
    const { container } = render(
      <LeaveBalanceCards balances={[makeBalance({ total: 10, used: 8, remaining: 2 })]} />
    )
    const bar = container.querySelector('.bg-amber-500')
    expect(bar).toBeInTheDocument()
  })

  it('uses green color when usage is below 70%', () => {
    const { container } = render(
      <LeaveBalanceCards balances={[makeBalance({ total: 12, used: 4, remaining: 8 })]} />
    )
    const bar = container.querySelector('.bg-green-500')
    expect(bar).toBeInTheDocument()
  })
})
