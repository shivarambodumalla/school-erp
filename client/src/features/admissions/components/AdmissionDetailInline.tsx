'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, XCircle, GraduationCap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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
  religion: string | null; motherTongue: string | null
  admissionType: string; previousSchoolName: string | null
  previousClass: string | null; previousTCNumber: string | null
  appliedAt: string; admittedAt: string | null
  enrolledAt: string | null; rejectedAt: string | null
  rejectionReason: string | null
  guardians: Guardian[]
  documents: Array<{
    id: string; documentTypeName: string; fileUrl: string
    fileName: string; isVerified: boolean; createdAt: string
  }>
  student: { id: string } | null
}

interface ClassItem {
  id: string; name: string
  sections: Array<{ id: string; name: string }>
}
interface AuditEntry { action: string; after: unknown; createdAt: string }

interface Props {
  admissionId: string
}

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  ADMITTED: 'bg-emerald-100 text-emerald-700',
  ENROLLED: 'bg-violet-100 text-violet-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
]

export function AdmissionDetailInline({ admissionId }: Props) {
  const router = useRouter()
  const [admission, setAdmission] = useState<Admission | null>(null)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEnroll, setShowEnroll] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/school/admissions/${admissionId}`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then(data => {
        setAdmission(data.admission ?? data)
        setClasses(data.classes ?? [])
        setAuditLogs(data.auditLogs ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [admissionId])

  if (loading) return <DetailSkeleton />
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>
  if (!admission) return null

  const initials = `${admission.firstName[0]}${admission.lastName[0]}`.toUpperCase()
  const color = AVATAR_COLORS[admission.firstName.charCodeAt(0) % AVATAR_COLORS.length]

  async function handleAdmit() {
    setActing(true)
    try {
      const res = await fetch(`/api/school/admissions/${admissionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADMIT' }),
      })
      if (!res.ok) { const err = await res.json().catch(() => null); toast.error(err?.error ?? 'Failed to admit'); return }
      const data = await res.json()
      toast.success(`Admitted — ${data.admissionNo}`)
      setAdmission(prev => prev ? { ...prev, status: 'ADMITTED', admissionNo: data.admissionNo, admittedAt: new Date().toISOString() } : prev)
    } catch { toast.error('Something went wrong') } finally { setActing(false) }
  }

  async function handleReject(reason: string) {
    setActing(true)
    try {
      const res = await fetch(`/api/school/admissions/${admissionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason }),
      })
      if (!res.ok) { const err = await res.json().catch(() => null); toast.error(err?.error ?? 'Failed to reject'); return }
      toast.success('Application rejected')
      setShowReject(false)
      setAdmission(prev => prev ? { ...prev, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectionReason: reason } : prev)
    } catch { toast.error('Something went wrong') } finally { setActing(false) }
  }

  async function handleEnroll(classId: string, sectionId?: string) {
    setActing(true)
    try {
      const res = await fetch(`/api/school/admissions/${admissionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ENROLL', classId, sectionId }),
      })
      if (!res.ok) { const err = await res.json().catch(() => null); toast.error(err?.error ?? 'Failed to enroll'); return }
      const data = await res.json()
      toast.success('Student enrolled successfully')
      setShowEnroll(false)
      setAdmission(prev => prev ? { ...prev, status: 'ENROLLED', enrolledAt: new Date().toISOString(), student: { id: data.studentId ?? '' } } : prev)
    } catch { toast.error('Something went wrong') } finally { setActing(false) }
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-xl shrink-0 flex items-center
            justify-center text-white text-lg font-bold ${color}`}>
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {admission.firstName} {admission.middleName ?? ''} {admission.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm text-muted-foreground">{admission.applicationNo}</span>
              {admission.admissionNo && (
                <span className="text-sm text-muted-foreground">· {admission.admissionNo}</span>
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
              <Button onClick={handleAdmit} disabled={acting} className="min-h-[44px]">
                <UserCheck className="h-4 w-4 mr-1.5" /> Admit
              </Button>
              <Button variant="outline" className="min-h-[44px]" onClick={() => setShowReject(true)}>
                <XCircle className="h-4 w-4 mr-1.5" /> Reject
              </Button>
            </>
          )}
          {admission.status === 'ADMITTED' && (
            <>
              <Button onClick={() => setShowEnroll(true)} disabled={acting} className="min-h-[44px]">
                <GraduationCap className="h-4 w-4 mr-1.5" /> Enroll
              </Button>
              <Button variant="outline" className="min-h-[44px]" onClick={() => setShowReject(true)}>
                <XCircle className="h-4 w-4 mr-1.5" /> Reject
              </Button>
            </>
          )}
          {admission.status === 'ENROLLED' && admission.student && (
            <Button variant="outline" className="min-h-[44px]"
              onClick={() => router.push('/management/students')}>
              <ExternalLink className="h-4 w-4 mr-1.5" /> View Student
            </Button>
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
        onGuardiansChange={gs => setAdmission(prev => prev ? { ...prev, guardians: gs } : prev)}
      />

      {/* Modals */}
      {showEnroll && (
        <EnrollModal classes={classes} acting={acting}
          onConfirm={handleEnroll} onClose={() => setShowEnroll(false)} />
      )}
      {showReject && (
        <RejectModal acting={acting}
          onConfirm={handleReject} onClose={() => setShowReject(false)} />
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 pt-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="h-10 bg-muted rounded" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  )
}
