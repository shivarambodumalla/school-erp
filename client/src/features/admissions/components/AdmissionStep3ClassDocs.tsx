'use client'

import { Label } from '@/components/ui/label'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateAdmissionInput } from '../schemas/admissionSchema'

interface AcademicYear { id: string; name: string; isCurrent: boolean }
interface Section { id: string; name: string }
interface ClassItem { id: string; name: string; sections: Section[] }

interface Props {
  form: UseFormReturn<CreateAdmissionInput>
  academicYears: AcademicYear[]
  classes: ClassItem[]
}

export function AdmissionStep3ClassDocs({ form, academicYears, classes }: Props) {
  const { register, watch, setValue } = form
  const selectedClassId = watch('classId')
  const selectedClass = classes.find(c => c.id === selectedClassId)
  const currentYear = academicYears.find(y => y.isCurrent)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="academicYearId">Academic Year *</Label>
          <select id="academicYearId" {...register('academicYearId')}
            defaultValue={currentYear?.id}
            className="w-full h-11 rounded-md border border-input bg-background
              px-3 text-sm">
            <option value="">Select year</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>
                {y.name} {y.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classId">Class</Label>
          <select id="classId"
            value={selectedClassId ?? ''}
            onChange={e => {
              setValue('classId', e.target.value || undefined)
              setValue('sectionId', undefined)
            }}
            className="w-full h-11 rounded-md border border-input bg-background
              px-3 text-sm">
            <option value="">Select class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sectionId">Section</Label>
          <select id="sectionId" {...register('sectionId')}
            disabled={!selectedClass}
            className="w-full h-11 rounded-md border border-input bg-background
              px-3 text-sm disabled:opacity-50">
            <option value="">Select section</option>
            {selectedClass?.sections.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          Document uploads will be available after the application is submitted.
          You can upload documents from the admission detail page.
        </p>
      </div>
    </div>
  )
}
