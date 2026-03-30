import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoleCard } from '../components/RoleCard'
import type { StaffRoleListItem, Permission } from '../types'

function makeRole(overrides: Partial<StaffRoleListItem> = {}): StaffRoleListItem {
  return {
    id: 'role-1',
    name: 'Test Role',
    description: 'A test role description',
    isSystemRole: false,
    permissions: [
      { feature: 'classes', access: 'FULL', scope: 'ALL' },
      { feature: 'attendance', access: 'VIEW', scope: 'OWN' },
      { feature: 'grades', access: 'NONE', scope: 'ALL' },
    ] as Permission[],
    createdAt: '2024-01-01T00:00:00Z',
    _count: { primaryStaff: 3, assignments: 2 },
    ...overrides,
  }
}

describe('RoleCard', () => {
  const onClick = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  it('renders role name and description', () => {
    render(<RoleCard role={makeRole()} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Test Role')).toBeInTheDocument()
    expect(screen.getByText('A test role description')).toBeInTheDocument()
  })

  it('displays correct staff count (primaryStaff + assignments)', () => {
    render(<RoleCard role={makeRole()} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows system badge for system roles', () => {
    const role = makeRole({ isSystemRole: true })
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('does NOT show system badge for custom roles', () => {
    const role = makeRole({ isSystemRole: false })
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.queryByText('System')).not.toBeInTheDocument()
  })

  it('shows permission summary counts', () => {
    render(<RoleCard role={makeRole()} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('1 Full')).toBeInTheDocument()
    expect(screen.getByText('1 View')).toBeInTheDocument()
    expect(screen.getByText('1 None')).toBeInTheDocument()
  })

  it('shows more menu for all roles including system roles', () => {
    const role = makeRole({ isSystemRole: true })
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByLabelText('More options')).toBeInTheDocument()
  })

  it('shows more menu button for custom roles', () => {
    const role = makeRole({ isSystemRole: false })
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByLabelText('More options')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const role = makeRole()
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Test Role'))
    expect(onClick).toHaveBeenCalledWith(role)
  })

  it('handles role with no permissions', () => {
    const role = makeRole({ permissions: [] })
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('No permissions set')).toBeInTheDocument()
  })

  it('handles role with no description', () => {
    const role = makeRole({ description: null })
    render(<RoleCard role={role} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Test Role')).toBeInTheDocument()
    expect(screen.queryByText('A test role description')).not.toBeInTheDocument()
  })
})
