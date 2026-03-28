'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronRight, Check, Loader2, X, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  createAdmissionSchema,
  type CreateAdmissionInput,
} from '../schemas/admissionSchema'
import { AdmissionStep1Personal } from './AdmissionStep1Personal'
import { AdmissionStep2Guardians } from './AdmissionStep2Guardians'
import { AdmissionStep3ClassDocs } from './AdmissionStep3ClassDocs'

interface AcademicYear { id: string; name: string; isCurrent: boolean }
interface Section { id: string; name: string }
interface ClassItem { id: string; name: string; sections: Section[] }

interface Guardian {
  type: 'FATHER' | 'MOTHER' | 'GUARDIAN'
  name: string; phone: string; email: string; relationship: string
  isPrimaryContact: boolean; isEmergencyContact: boolean; canLogin: boolean
}

const STEPS = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'guardians', label: 'Guardian Details' },
  { key: 'class', label: 'Class & Academic Year' },
]

interface Props {
  academicYears: AcademicYear[]
  classes: ClassItem[]
}

export function NewAdmissionForm({ academicYears, classes }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inquiryId = searchParams.get('inquiryId')
  const prefillName = searchParams.get('name') ?? ''
  const prefillPhone = searchParams.get('phone') ?? ''
  const prefillEmail = searchParams.get('email') ?? ''

  const nameParts = prefillName.trim().split(/\s+/)
  const prefillFirst = nameParts[0] ?? ''
  const prefillLast = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

  // Phase: type selection → accordion form
  const prefillType = searchParams.get('type')
  const [selectedType, setSelectedType] = useState<'NEW' | 'TRANSFER' | null>(
    prefillType === 'TRANSFER' ? 'TRANSFER' : prefillType === 'NEW' ? 'NEW' : null,
  )
  const [formStarted, setFormStarted] = useState(!!prefillType)

  const [activeStep, setActiveStep] = useState(0)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [guardians, setGuardians] = useState<Guardian[]>(() => {
    if (prefillPhone) {
      return [{
        type: 'GUARDIAN' as const,
        name: prefillName,
        phone: prefillPhone,
        email: prefillEmail,
        relationship: '',
        isPrimaryContact: true,
        isEmergencyContact: false,
        canLogin: false,
      }]
    }
    return []
  })
  const [guardianError, setGuardianError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const currentYear = academicYears.find(y => y.isCurrent)

  const form = useForm<CreateAdmissionInput>({
    resolver: zodResolver(createAdmissionSchema),
    defaultValues: {
      firstName: prefillFirst, lastName: prefillLast, dateOfBirth: '',
      gender: undefined, admissionType: selectedType ?? 'NEW',
      academicYearId: currentYear?.id ?? '',
    },
  })

  const handleStartForm = useCallback(() => {
    if (!selectedType) return
    form.setValue('admissionType', selectedType)
    setFormStarted(true)
  }, [selectedType, form])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  function clearPhoto() {
    setPhotoFile(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    form.setValue('photoUrl', '')
  }

  async function handleNext() {
    if (activeStep === 0) {
      const valid = await form.trigger([
        'firstName', 'lastName', 'dateOfBirth', 'gender',
      ])
      if (!valid) return
    }
    if (activeStep === 1 && guardians.length === 0) {
      setGuardianError('At least one guardian is required')
      return
    }
    setGuardianError('')
    setExpandedStep(null)
    setActiveStep(s => Math.min(s + 1, STEPS.length))
  }

  function handleStepClick(step: number) {
    if (step < activeStep) {
      setExpandedStep(prev => prev === step ? null : step)
    }
  }

  function getStepSummary(step: number): string {
    const v = form.getValues()
    switch (step) {
      case 0:
        return `${v.firstName} ${v.lastName} · ${v.gender ?? ''} · ${v.dateOfBirth}`
      case 1:
        return `${guardians.length} guardian${guardians.length !== 1 ? 's' : ''} added`
      case 2: {
        const yearName = academicYears.find(y => y.id === v.academicYearId)?.name ?? ''
        const className = classes.find(c => c.id === v.classId)?.name ?? ''
        return [yearName, className].filter(Boolean).join(' · ') || 'Not selected'
      }
      default:
        return ''
    }
  }

  async function handleSubmit() {
    if (guardians.length === 0) {
      toast.error('At least one guardian is required')
      return
    }

    setSubmitting(true)
    try {
      const values = form.getValues()

      // TODO: Upload photo file to storage and get URL
      // For now, photo upload stores a preview only
      if (photoFile) {
        // Placeholder — replace with real upload when file storage API is ready
        values.photoUrl = photoPreview ?? ''
      }

      const res = await fetch('/api/school/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to submit')
        return
      }

      for (const g of guardians) {
        await fetch(`/api/school/admissions/${data.id}/guardians`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(g),
        })
      }

      if (inquiryId) {
        await fetch(`/api/school/inquiries/${inquiryId}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admissionId: data.id }),
        })
      }

      toast.success(`Application submitted — ${data.applicationNo}`)
      router.push(`/management/admissions/${data.id}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Phase 1: Type selection ──
  if (!formStarted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Application</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the type of admission to begin
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/management/admissions')}
            className="min-h-[44px]">
            <X className="h-4 w-4 mr-1.5" /> Cancel
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { type: 'NEW' as const, title: 'New Admission', desc: 'First-time student joining the school' },
            { type: 'TRANSFER' as const, title: 'Transfer', desc: 'Student transferring from another school' },
          ]).map(opt => (
            <button key={opt.type}
              onClick={() => setSelectedType(opt.type)}
              className={`text-left p-6 rounded-xl border-2 transition-all
                hover:border-primary/50 hover:shadow-sm
                ${selectedType === opt.type
                  ? 'border-primary bg-primary/5'
                  : 'border-muted'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${selectedType === opt.type ? 'border-primary' : 'border-muted-foreground/30'}`}>
                  {selectedType === opt.type && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{opt.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleStartForm} disabled={!selectedType} className="min-h-[44px]">
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Phase 2: Accordion stepper form ──
  const isReviewStep = activeStep >= STEPS.length

  return (
    <div className="space-y-6">
      {/* Header with cancel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedType === 'TRANSFER' ? 'Transfer Application' : 'New Application'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fill in the details step by step
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/management/admissions')}
          className="min-h-[44px]">
          <X className="h-4 w-4 mr-1.5" /> Cancel
        </Button>
      </div>

      {/* Accordion steps — hidden during review */}
      {!isReviewStep && <div className="space-y-3">
        {STEPS.map((s, i) => {
          const isCompleted = i < activeStep
          const isActive = i === activeStep && !isReviewStep
          const isExpanded = expandedStep === i
          const showBody = isActive || isExpanded

          return (
            <div key={s.key} className="rounded-xl border overflow-hidden">
              {/* Step header */}
              <button
                type="button"
                onClick={() => handleStepClick(i)}
                disabled={!isCompleted}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors
                  ${isCompleted ? 'cursor-pointer hover:bg-muted/50' : ''}
                  ${isActive ? 'bg-muted/30' : ''}
                  ${!isCompleted && !isActive ? 'opacity-50' : ''}`}
              >
                {/* Step number / check */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center
                  text-xs font-bold shrink-0
                  ${isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-primary/10 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'}`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!isCompleted && !isActive ? 'text-muted-foreground' : ''}`}>
                    {s.label}
                  </p>
                  {isCompleted && !isExpanded && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {getStepSummary(i)}
                    </p>
                  )}
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-1 text-xs text-primary shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <><Pencil className="h-3 w-3" /> Edit</>
                    )}
                  </div>
                )}
                {isActive && (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Step body */}
              {showBody && (
                <div className="px-5 pb-5 pt-2 border-t">
                  {i === 0 && (
                    <AdmissionStep1Personal
                      form={form}
                      photoPreview={photoPreview}
                      onPhotoChange={handlePhotoChange}
                      onPhotoClear={clearPhoto}
                    />
                  )}
                  {i === 1 && (
                    <AdmissionStep2Guardians
                      guardians={guardians}
                      onChange={g => { setGuardians(g); setGuardianError('') }}
                      error={guardianError}
                    />
                  )}
                  {i === 2 && (
                    <AdmissionStep3ClassDocs
                      form={form}
                      academicYears={academicYears}
                      classes={classes}
                    />
                  )}

                  {/* Next button inside step */}
                  {isActive && (
                    <div className="flex justify-end mt-5">
                      <Button onClick={handleNext} className="min-h-[44px]">
                        {i < STEPS.length - 1 ? 'Next' : 'Review'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Done editing button for expanded completed steps */}
                  {isExpanded && (
                    <div className="flex justify-end mt-5">
                      <Button variant="outline" size="sm"
                        onClick={() => setExpandedStep(null)} className="min-h-[44px]">
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>}

      {/* Review & Submit section */}
      {isReviewStep && (
        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
            <ReviewContent
              form={form}
              guardians={guardians}
              academicYears={academicYears}
              classes={classes}
              photoPreview={photoPreview}
              onGoToStep={(step) => { setActiveStep(step); setExpandedStep(null) }}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => router.push('/management/admissions')}
              className="min-h-[44px]">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="min-h-[44px]">
              {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Review content (inline, replaces AdmissionStep4Review) ── */

function ReviewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  )
}

function ReviewSection({ title, step, onEdit, children }: {
  title: string; step: number; onEdit: (s: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <button onClick={() => onEdit(step)}
          className="text-xs text-primary hover:underline min-h-[44px] px-2">
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

interface ReviewProps {
  form: ReturnType<typeof useForm<CreateAdmissionInput>>
  guardians: Array<{
    type: string; name: string; phone: string; email: string
    isPrimaryContact: boolean; isEmergencyContact: boolean; canLogin: boolean
  }>
  academicYears: Array<{ id: string; name: string }>
  classes: Array<{ id: string; name: string }>
  photoPreview: string | null
  onGoToStep: (step: number) => void
}

function ReviewContent({ form, guardians, academicYears, classes, photoPreview, onGoToStep }: ReviewProps) {
  const v = form.getValues()
  const yearName = academicYears.find(y => y.id === v.academicYearId)?.name
  const className = classes.find(c => c.id === v.classId)?.name

  return (
    <div className="space-y-6 divide-y">
      <ReviewSection title="Personal Details" step={0} onEdit={onGoToStep}>
        <div className="flex items-start gap-4">
          {photoPreview && (
            <img src={photoPreview} alt="Photo"
              className="h-16 w-16 rounded-xl object-cover border shrink-0" />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
            <ReviewField label="First Name" value={v.firstName} />
            <ReviewField label="Middle Name" value={v.middleName} />
            <ReviewField label="Last Name" value={v.lastName} />
            <ReviewField label="Date of Birth" value={v.dateOfBirth} />
            <ReviewField label="Gender" value={v.gender} />
            <ReviewField label="Blood Group" value={v.bloodGroup} />
            <ReviewField label="Nationality" value={v.nationality} />
            <ReviewField label="Religion" value={v.religion} />
            <ReviewField label="Mother Tongue" value={v.motherTongue} />
            <ReviewField label="Admission Type" value={v.admissionType} />
            {v.admissionType === 'TRANSFER' && (
              <>
                <ReviewField label="Previous School" value={v.previousSchoolName} />
                <ReviewField label="Previous Class" value={v.previousClass} />
                <ReviewField label="TC Number" value={v.previousTCNumber} />
              </>
            )}
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title="Guardians" step={1} onEdit={onGoToStep}>
        {guardians.length === 0 ? (
          <p className="text-sm text-red-500">No guardians added</p>
        ) : (
          <div className="space-y-2 pt-1">
            {guardians.map((g, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted">
                  {g.type}
                </span>
                <span>{g.name}</span>
                <span className="text-muted-foreground">{g.phone}</span>
                {g.isPrimaryContact && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Class & Academic Year" step={2} onEdit={onGoToStep}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <ReviewField label="Academic Year" value={yearName} />
          <ReviewField label="Class" value={className} />
        </div>
      </ReviewSection>
    </div>
  )
}
