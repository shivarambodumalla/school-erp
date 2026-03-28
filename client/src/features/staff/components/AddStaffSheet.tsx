'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}

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
  const [createLogin, setCreateLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')

  const reset = () => {
    setFirstName(''); setLastName(''); setDesignation('')
    setJoiningDate(''); setPhone(''); setPersonalEmail('')
    setQualification(''); setSpecialization('')
    setCreateLogin(false); setLoginEmail('')
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !designation || !joiningDate) {
      toast.error('Please fill required fields')
      return
    }
    setSaving(true)
    const res = await fetch('/api/school/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, lastName, designation, joiningDate,
        phone: phone || undefined,
        personalEmail: personalEmail || undefined,
        qualification: qualification || undefined,
        specialization: specialization || undefined,
        createLogin, loginEmail: loginEmail || undefined,
      }),
    })
    setSaving(false)

    if (!res.ok) {
      toast.error('Failed to create staff')
      return
    }

    const data = await res.json() as {
      employeeNo: string; tempPassword: string | null
    }
    toast.success(`Staff ${data.employeeNo} created`)
    if (data.tempPassword) {
      toast.info(`Temp password: ${data.tempPassword}`)
    }
    reset()
    onOpenChange(false)
    onCreated()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Staff</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div>
            <Label>Designation *</Label>
            <Input value={designation} onChange={e => setDesignation(e.target.value)}
              className="min-h-[44px] mt-1" />
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
                className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Personal Email</Label>
              <Input type="email" value={personalEmail}
                onChange={e => setPersonalEmail(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Qualification</Label>
              <Input value={qualification}
                onChange={e => setQualification(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Specialization</Label>
              <Input value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Create Login Account</Label>
              <Switch checked={createLogin}
                onCheckedChange={setCreateLogin} />
            </div>
            {createLogin && (
              <div className="mt-3">
                <Label>Login Email</Label>
                <Input type="email" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="min-h-[44px] mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  Temporary password: TempPass@123
                </p>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={saving}
            className="w-full min-h-[44px]">
            {saving ? 'Creating...' : 'Add Staff'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
