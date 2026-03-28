'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { CreateAdmissionInput } from '../schemas/admissionSchema'

interface Guardian {
  type: string; name: string; phone: string; email: string
  isPrimaryContact: boolean; isEmergencyContact: boolean; canLogin: boolean
}
interface AcademicYear { id: string; name: string }
interface ClassItem { id: string; name: string }

interface Props {
  form: UseFormReturn<CreateAdmissionInput>
  guardians: Guardian[]
  academicYears: AcademicYear[]
  classes: ClassItem[]
  onGoToStep: (step: number) => void
}

function Section({ title, step, onEdit, children }: {
  title: string; step: number; onEdit: (s: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <button onClick={() => onEdit(step)}
          className="text-xs text-primary hover:underline">
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  )
}

export function AdmissionStep4Review({
  form, guardians, academicYears, classes, onGoToStep,
}: Props) {
  const v = form.getValues()
  const yearName = academicYears.find(y => y.id === v.academicYearId)?.name
  const className = classes.find(c => c.id === v.classId)?.name

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review & Submit</h2>

      <Section title="Personal Details" step={0} onEdit={onGoToStep}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="First Name" value={v.firstName} />
          <Field label="Middle Name" value={v.middleName} />
          <Field label="Last Name" value={v.lastName} />
          <Field label="Date of Birth" value={v.dateOfBirth} />
          <Field label="Gender" value={v.gender} />
          <Field label="Blood Group" value={v.bloodGroup} />
          <Field label="Nationality" value={v.nationality} />
          <Field label="Religion" value={v.religion} />
          <Field label="Mother Tongue" value={v.motherTongue} />
          <Field label="Admission Type" value={v.admissionType} />
          {v.admissionType === 'TRANSFER' && (
            <>
              <Field label="Previous School" value={v.previousSchoolName} />
              <Field label="Previous Class" value={v.previousClass} />
              <Field label="TC Number" value={v.previousTCNumber} />
            </>
          )}
        </div>
      </Section>

      <Section title="Guardians" step={1} onEdit={onGoToStep}>
        {guardians.length === 0 ? (
          <p className="text-sm text-red-500">No guardians added</p>
        ) : (
          <div className="space-y-2">
            {guardians.map((g, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded
                  bg-muted">{g.type}</span>
                <span>{g.name}</span>
                <span className="text-muted-foreground">{g.phone}</span>
                {g.isPrimaryContact && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded
                    bg-blue-100 text-blue-700">Primary</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Class & Academic Year" step={2} onEdit={onGoToStep}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Academic Year" value={yearName} />
          <Field label="Class" value={className} />
        </div>
      </Section>
    </div>
  )
}
