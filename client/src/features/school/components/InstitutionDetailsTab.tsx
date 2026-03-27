'use client'

import { useState, useTransition } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateInstitutionDetails } from
  '@/features/school/actions/institutionDetailsActions'

interface Institution {
  name: string
  subdomain: string
  board: string
  institutionType: string
  phone: string | null
  website: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pinCode: string | null
  establishedYear: number | null
  studentCapacity: number | null
}

interface Props {
  institution: Institution
}

export function InstitutionDetailsTab({ institution }: Props) {
  const [form, setForm] = useState({
    name: institution.name,
    phone: institution.phone ?? '',
    website: institution.website ?? '',
    addressLine1: institution.addressLine1 ?? '',
    addressLine2: institution.addressLine2 ?? '',
    city: institution.city ?? '',
    state: institution.state ?? '',
    pinCode: institution.pinCode ?? '',
    establishedYear: institution.establishedYear?.toString() ?? '',
    studentCapacity: institution.studentCapacity?.toString() ?? '',
  })
  const [isPending, startTransition] = useTransition()

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateInstitutionDetails({
        name: form.name,
        phone: form.phone || null,
        website: form.website || null,
        addressLine1: form.addressLine1 || null,
        addressLine2: form.addressLine2 || null,
        city: form.city || null,
        state: form.state || null,
        pinCode: form.pinCode || null,
        establishedYear: form.establishedYear
          ? parseInt(form.establishedYear, 10) : null,
        studentCapacity: form.studentCapacity
          ? parseInt(form.studentCapacity, 10) : null,
      })

      if (result.success) {
        toast.success('Institution details saved')
      } else {
        toast.error(result.error ?? 'Failed to save')
      }
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Read-only info */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="font-semibold text-sm">Platform Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Subdomain</p>
            <p className="font-medium">{institution.subdomain}.onflows.app</p>
          </div>
          <div>
            <p className="text-muted-foreground">Board</p>
            <p className="font-medium">{institution.board}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Institution Type</p>
            <p className="font-medium">{institution.institutionType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Basic Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Basic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="inst-name">Institution Name</Label>
            <Input
              id="inst-name"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-phone">Phone</Label>
            <Input
              id="inst-phone"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-website">Website</Label>
            <Input
              id="inst-website"
              value={form.website}
              onChange={e => handleChange('website', e.target.value)}
              placeholder="https://school.edu.in"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-year">Established Year</Label>
            <Input
              id="inst-year"
              type="number"
              value={form.establishedYear}
              onChange={e => handleChange('establishedYear', e.target.value)}
              placeholder="1990"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-capacity">Student Capacity</Label>
            <Input
              id="inst-capacity"
              type="number"
              value={form.studentCapacity}
              onChange={e => handleChange('studentCapacity', e.target.value)}
              placeholder="500"
              className="min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="inst-addr1">Address Line 1</Label>
            <Input
              id="inst-addr1"
              value={form.addressLine1}
              onChange={e => handleChange('addressLine1', e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="inst-addr2">Address Line 2</Label>
            <Input
              id="inst-addr2"
              value={form.addressLine2}
              onChange={e => handleChange('addressLine2', e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-city">City</Label>
            <Input
              id="inst-city"
              value={form.city}
              onChange={e => handleChange('city', e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-state">State</Label>
            <Input
              id="inst-state"
              value={form.state}
              onChange={e => handleChange('state', e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-pin">PIN Code</Label>
            <Input
              id="inst-pin"
              value={form.pinCode}
              onChange={e => handleChange('pinCode', e.target.value)}
              placeholder="560001"
              className="min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="min-h-[44px]">
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Saving...' : 'Save Details'}
        </Button>
      </div>
    </div>
  )
}