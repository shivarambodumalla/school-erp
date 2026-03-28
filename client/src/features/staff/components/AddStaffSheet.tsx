'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}

interface DeptOption { id: string; name: string }
interface RoleOption { id: string; name: string }

export function AddStaffSheet({ open, onOpenChange, onCreated }: Props) {
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [designation, setDesignation] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [phone, setPhone] = useState('')
  const [personalEmail, setPersonalEmail] = useState('')
  const [qualification, setQualification] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [primaryRoleId, setPrimaryRoleId] = useState('')
  const [createLogin, setCreateLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [portalType, setPortalType] = useState('TEACHER')

  const [departments, setDepartments] = useState<DeptOption[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])

  useEffect(() => {
    if (!open) return
    fetch('/api/school/settings/departments')
      .then(r => r.ok ? r.json() : [])
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => {})
    fetch('/api/school/staff-roles')
      .then(r => r.ok ? r.json() : [])
      .then(d => setRoles(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [open])

  const reset = () => {
    setFirstName(''); setLastName(''); setDesignation('')
    setJoiningDate(''); setPhone(''); setPersonalEmail('')
    setQualification(''); setSpecialization('')
    setDepartmentId(''); setPrimaryRoleId('')
    setCreateLogin(false); setLoginEmail(''); setPortalType('TEACHER')
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !designation || !joiningDate) {
      toast.error('Please fill all required fields (First Name, Last Name, Designation, Joining Date)')
      return
    }
    if (createLogin && !loginEmail) {
      toast.error('Login email is required when creating a portal account')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/school/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, designation, joiningDate,
          phone: phone || undefined,
          personalEmail: personalEmail || undefined,
          qualification: qualification || undefined,
          specialization: specialization || undefined,
          departmentId: departmentId || undefined,
          primaryRoleId: primaryRoleId || undefined,
          createLogin,
          loginEmail: loginEmail || undefined,
          portalType: createLogin ? portalType : undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error: string }
        toast.error(err.error || 'Failed to create staff')
        return
      }

      const data = await res.json() as {
        employeeNo: string; tempPassword: string | null
      }
      toast.success(`Staff ${data.employeeNo} created successfully`)
      if (data.tempPassword) {
        toast.info(`Temporary password: ${data.tempPassword}`, { duration: 10000 })
      }
      reset()
      onOpenChange(false)
      onCreated()
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Staff Member</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. Priya" className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="e.g. Nair" className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div>
            <Label>Designation *</Label>
            <Input value={designation} onChange={e => setDesignation(e.target.value)}
              placeholder="e.g. Senior Science Teacher" className="min-h-[44px] mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="min-h-[44px] mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Role</Label>
              <Select value={primaryRoleId} onValueChange={setPrimaryRoleId}>
                <SelectTrigger className="min-h-[44px] mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Joining Date *</Label>
            <Input type="date" value={joiningDate}
              onChange={e => setJoiningDate(e.target.value)}
              className="min-h-[44px] mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Personal Email</Label>
              <Input type="email" value={personalEmail}
                onChange={e => setPersonalEmail(e.target.value)}
                placeholder="priya@gmail.com" className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Qualification</Label>
              <Input value={qualification}
                onChange={e => setQualification(e.target.value)}
                placeholder="M.Sc Physics" className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Specialization</Label>
              <Input value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                placeholder="Quantum Mechanics" className="min-h-[44px] mt-1" />
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Create Portal Login</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow this staff member to log in to the portal
                </p>
              </div>
              <Switch checked={createLogin}
                onCheckedChange={setCreateLogin} />
            </div>
            {createLogin && (
              <div className="space-y-3 pl-0">
                <div>
                  <Label>Login Email *</Label>
                  <Input type="email" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="priya@stmarys.com"
                    className="min-h-[44px] mt-1" />
                </div>
                <div>
                  <Label>Portal Type</Label>
                  <Select value={portalType} onValueChange={setPortalType}>
                    <SelectTrigger className="min-h-[44px] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Temporary password: <span className="font-mono">TempPass@123</span>
                </p>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={saving}
            className="w-full min-h-[44px]">
            {saving ? 'Creating...' : 'Add Staff Member'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
