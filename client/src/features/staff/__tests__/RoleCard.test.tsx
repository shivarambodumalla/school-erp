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
  const onView = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  it('renders role name and description', () => {
    render(<RoleCard role={makeRole()} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Test Role')).toBeInTheDocument()
    expect(screen.getByText('A test role description')).toBeInTheDocument()
  })

  it('displays correct staff count (primaryStaff + assignments)', () => {
    render(<RoleCard role={makeRole()} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows system badge for system roles', () => {
    const role = makeRole({ isSystemRole: true })
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('does NOT show system badge for custom roles', () => {
    const role = makeRole({ isSystemRole: false })
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.queryByText('System')).not.toBeInTheDocument()
  })

  it('shows permission summary counts', () => {
    render(<RoleCard role={makeRole()} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('1 Full')).toBeInTheDocument()
    expect(screen.getByText('1 View')).toBeInTheDocument()
    expect(screen.getByText('1 None')).toBeInTheDocument()
  })

  it('hides Edit and Delete buttons for system roles', () => {
    const role = makeRole({ isSystemRole: true })
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('shows Edit and Delete buttons for custom roles', () => {
    const role = makeRole({ isSystemRole: false })
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onView when View button is clicked', () => {
    const role = makeRole()
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('View'))
    expect(onView).toHaveBeenCalledWith(role)
  })

  it('calls onEdit when Edit button is clicked', () => {
    const role = makeRole()
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(role)
  })

  it('calls onDelete when Delete button is clicked', () => {
    const role = makeRole()
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith(role)
  })

  it('handles role with no permissions', () => {
    const role = makeRole({ permissions: [] })
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('No permissions set')).toBeInTheDocument()
  })

  it('handles role with no description', () => {
    const role = makeRole({ description: null })
    render(<RoleCard role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Test Role')).toBeInTheDocument()
    expect(screen.queryByText('A test role description')).not.toBeInTheDocument()
  })
})
