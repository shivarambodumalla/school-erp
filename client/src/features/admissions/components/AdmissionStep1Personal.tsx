'use client'

import { Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateAdmissionInput } from '../schemas/admissionSchema'

interface Props {
  form: UseFormReturn<CreateAdmissionInput>
  photoPreview: string | null
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhotoClear: () => void
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export function AdmissionStep1Personal({ form, photoPreview, onPhotoChange, onPhotoClear }: Props) {
  const { register, formState: { errors }, watch } = form
  const admissionType = watch('admissionType')

  return (
    <div className="space-y-5">
      {/* Photo upload + name row */}
      <div className="flex items-start gap-5">
        {/* Photo upload */}
        <div className="shrink-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Photo</Label>
          {photoPreview ? (
            <div className="relative h-20 w-20 rounded-xl overflow-hidden border">
              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              <button type="button" onClick={onPhotoClear}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white
                  hover:bg-black/70 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="h-20 w-20 rounded-xl border-2 border-dashed flex flex-col
              items-center justify-center cursor-pointer hover:border-primary/50
              transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </label>
          )}
        </div>

        {/* Name fields */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register('firstName')} className="min-h-[44px]" />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="middleName" {...register('middleName')} className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register('lastName')} className="min-h-[44px]" />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input id="dateOfBirth" type="date" {...register('dateOfBirth')}
            className="min-h-[44px]" />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender *</Label>
          <select id="gender" {...register('gender')}
            className="w-full h-11 rounded-md border border-input bg-background
              px-3 text-sm">
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-red-500">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <select id="bloodGroup" {...register('bloodGroup')}
            className="w-full h-11 rounded-md border border-input bg-background
              px-3 text-sm">
            <option value="">Select</option>
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nationality">Nationality</Label>
          <Input id="nationality" {...register('nationality')} className="min-h-[44px]" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="religion">Religion</Label>
          <Input id="religion" {...register('religion')} className="min-h-[44px]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="motherTongue">Mother Tongue</Label>
        <Input id="motherTongue" {...register('motherTongue')}
          className="min-h-[44px] max-w-xs" />
      </div>

      {/* Transfer details — shown when admission type is TRANSFER */}
      {admissionType === 'TRANSFER' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4
          rounded-lg bg-muted/50 border">
          <div className="sm:col-span-3">
            <p className="text-sm font-medium mb-3">Transfer Details</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="previousSchoolName">Previous School *</Label>
            <Input id="previousSchoolName" {...register('previousSchoolName')}
              className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="previousClass">Previous Class</Label>
            <Input id="previousClass" {...register('previousClass')}
              className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="previousTCNumber">TC Number</Label>
            <Input id="previousTCNumber" {...register('previousTCNumber')}
              className="min-h-[44px]" />
          </div>
        </div>
      )}
    </div>
  )
}
