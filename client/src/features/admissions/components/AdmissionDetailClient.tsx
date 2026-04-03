'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import Link from 'next/link'
import { ArrowLeft, UserCheck, XCircle, GraduationCap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { generateColor } from '@/lib/colors'
import { AdmissionDetailsTabs } from './AdmissionDetailsTabs'
import { EnrollModal } from './EnrollModal'
import { RejectModal } from './RejectModal'

interface Guardian {
  id: string; type: string; name: string; phone: string
  email: string | null; relationship: string | null
  isPrimaryContact: boolean; isEmergencyContact: boolean; canLogin: boolean
}

interface Admission {
  id: string; applicationNo: string; admissionNo: string | null
  status: string; firstName: string; middleName: string | null
  lastName: string; dateOfBirth: string; gender: string
  bloodGroup: string | null; nationality: string | null
  religion: string | null; motherTongue: string | null; photoUrl: string | null
  admissionType: string; previousSchoolName: string | null
  previousClass: string | null; previousTCNumber: string | null
  classId: string | null; sectionId: string | null; academicYearId: string
  appliedAt: string; admittedAt: string | null
  enrolledAt: string | null; rejectedAt: string | null
  rejectionReason: string | null
  guardians: Guardian[]
  documents: Array<{ id: string; documentTypeName: string; fileUrl: string; fileName: string; isVerified: boolean; createdAt: string }>
  student: { id: string } | null
}

interface ClassItem { id: string; name: string; sections: Array<{ id: string; name: string }> }
interface AuditEntry { action: string; after: unknown; createdAt: string }

interface Props {
  admission: Admission
  classes: ClassItem[]
  auditLogs: AuditEntry[]
}

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  ADMITTED: 'bg-emerald-100 text-emerald-700',
  ENROLLED: 'bg-violet-100 text-violet-700',
  REJECTED: 'bg-red-100 text-red-700',
}


export function AdmissionDetailClient({ admission: initial, classes, auditLogs }: Props) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()
  const [admission, setAdmission] = useState(initial)
  const [showEnroll, setShowEnroll] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [acting, setActing] = useState(false)

  const initials = `${admission.firstName[0]}${admission.lastName[0]}`.toUpperCase()
  const color = generateColor(admission.firstName)

  async function handleAdmit() {
    setActing(true)
    try {
      const res = await fetch(`/api/school/admissions/${admission.id}/status${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADMIT' }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(`Admitted — ${data.admissionNo}`)
      router.refresh()
    } finally { setActing(false) }
  }

  async function handleReject(reason: string) {
    setActing(true)
    try {
      const res = await fetch(`/api/school/admissions/${admission.id}/status${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Application rejected')
      setShowReject(false)
      router.refresh()
    } finally { setActing(false) }
  }

  async function handleEnroll(classId: string, sectionId?: string) {
    setActing(true)
    try {
      const res = await fetch(`/api/school/admissions/${admission.id}/status${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ENROLL', classId, sectionId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Student enrolled successfully')
      setShowEnroll(false)
      router.push(`/management/students`)
    } finally { setActing(false) }
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <Link href="/management/admissions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground
          hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Admissions
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl shrink-0 flex items-center
            justify-center text-gray-800 text-lg font-bold" style={{ backgroundColor: color }}>
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {admission.firstName} {admission.middleName ?? ''} {admission.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {admission.applicationNo}
              </span>
              {admission.admissionNo && (
                <span className="text-sm text-muted-foreground">
                  · {admission.admissionNo}
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5
                rounded-full text-xs font-medium ${STATUS_STYLES[admission.status]}`}>
                {admission.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 shrink-0">
          {admission.status === 'APPLIED' && (
            <>
              <Button onClick={handleAdmit} disabled={acting}>
                <UserCheck className="h-4 w-4 mr-1.5" /> Admit
              </Button>
              <Button variant="outline" onClick={() => setShowReject(true)}>
                <XCircle className="h-4 w-4 mr-1.5" /> Reject
              </Button>
            </>
          )}
          {admission.status === 'ADMITTED' && (
            <>
              <Button onClick={() => setShowEnroll(true)} disabled={acting}>
                <GraduationCap className="h-4 w-4 mr-1.5" /> Enroll
              </Button>
              <Button variant="outline" onClick={() => setShowReject(true)}>
                <XCircle className="h-4 w-4 mr-1.5" /> Reject
              </Button>
            </>
          )}
          {admission.status === 'ENROLLED' && admission.student && (
            <Link href="/management/students">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-1.5" /> View Student
              </Button>
            </Link>
          )}
          {admission.status === 'REJECTED' && admission.rejectionReason && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              Rejected: {admission.rejectionReason}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <AdmissionDetailsTabs
        admission={admission}
        auditLogs={auditLogs}
        onGuardiansChange={gs => setAdmission(prev => ({ ...prev, guardians: gs }))}
      />

      {/* Modals */}
      {showEnroll && (
        <EnrollModal
          classes={classes}
          acting={acting}
          onConfirm={handleEnroll}
          onClose={() => setShowEnroll(false)}
        />
      )}
      {showReject && (
        <RejectModal
          acting={acting}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
        />
      )}
    </div>
  )
}
