'use client'

import { useState, useEffect } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Calendar, User, Phone, Mail, MapPin,
  School, CheckCircle2, Clock, ArrowRight,
} from 'lucide-react'
import { ADMISSION_STATUS_COLORS } from '@/lib/colors'

interface AdmissionDetail {
  id: string
  applicationNo: string
  admissionNo: string | null
  status: string
  firstName: string
  middleName: string | null
  lastName: string
  dateOfBirth: string
  gender: string
  bloodGroup: string | null
  nationality: string | null
  religion: string | null
  motherTongue: string | null
  admissionType: string
  previousSchoolName: string | null
  previousClass: string | null
  previousTCNumber: string | null
  photoUrl: string | null
  appliedAt: string
  admittedAt: string | null
  enrolledAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  guardians: {
    id: string; type: string; name: string; phone: string
    email: string | null; relationship: string | null
    isPrimaryContact: boolean
  }[]
  documents: {
    id: string; documentTypeName: string; fileName: string
    fileUrl: string; isVerified: boolean; createdAt: string
  }[]
}

interface Props {
  admissionId: string
}

export function StudentAdmissionTab({ admissionId }: Props) {
  const { apiParam } = useInstitutionId()
  const [admission, setAdmission] = useState<AdmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/school/admissions/${admissionId}${apiParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setAdmission(data?.admission ?? data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [admissionId, apiParam])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    )
  }

  if (!admission) {
    return (
      <div className="rounded-xl border bg-muted/30 p-8 text-center text-muted-foreground text-sm">
        Admission record not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Admission Timeline</h3>
        <div className="space-y-3">
          <TimelineItem
            label="Application Submitted"
            date={admission.appliedAt}
            status="done"
            detail={`Application No: ${admission.applicationNo}`}
          />
          {admission.admittedAt && (
            <TimelineItem
              label="Admitted"
              date={admission.admittedAt}
              status="done"
              detail={admission.admissionNo ? `Admission No: ${admission.admissionNo}` : undefined}
            />
          )}
          {admission.enrolledAt && (
            <TimelineItem
              label="Enrolled as Student"
              date={admission.enrolledAt}
              status="done"
            />
          )}
          {admission.rejectedAt && (
            <TimelineItem
              label="Rejected"
              date={admission.rejectedAt}
              status="rejected"
              detail={admission.rejectionReason ?? undefined}
            />
          )}
        </div>
      </div>

      {/* Application Form */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Application Form</h3>
          <Badge variant="secondary" className={ADMISSION_STATUS_COLORS[admission.status] ?? ''}>
            {admission.status}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow icon={User} label="Full Name" value={`${admission.firstName} ${admission.middleName ?? ''} ${admission.lastName}`.trim()} />
          <InfoRow icon={Calendar} label="Date of Birth" value={new Date(admission.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
          <InfoRow icon={User} label="Gender" value={admission.gender} />
          {admission.bloodGroup && <InfoRow icon={User} label="Blood Group" value={admission.bloodGroup} />}
          {admission.nationality && <InfoRow icon={MapPin} label="Nationality" value={admission.nationality} />}
          {admission.religion && <InfoRow icon={User} label="Religion" value={admission.religion} />}
          {admission.motherTongue && <InfoRow icon={User} label="Mother Tongue" value={admission.motherTongue} />}
          <InfoRow icon={FileText} label="Admission Type" value={admission.admissionType} />
          {admission.previousSchoolName && <InfoRow icon={School} label="Previous School" value={admission.previousSchoolName} />}
          {admission.previousClass && <InfoRow icon={School} label="Previous Class" value={admission.previousClass} />}
          {admission.previousTCNumber && <InfoRow icon={FileText} label="TC Number" value={admission.previousTCNumber} />}
        </div>
      </div>

      {/* Guardians from admission */}
      {admission.guardians.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Guardians (from Application)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {admission.guardians.map(g => (
              <div key={g.id} className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{g.name}</p>
                  <Badge variant="outline" className="text-[10px]">{g.type}</Badge>
                </div>
                {g.relationship && <p className="text-xs text-muted-foreground">{g.relationship}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{g.phone}</span>
                  {g.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{g.email}</span>}
                </div>
                {g.isPrimaryContact && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Primary Contact</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents from admission */}
      {admission.documents.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Documents (from Application)</h3>
          <div className="space-y-2">
            {admission.documents.map(d => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{d.documentTypeName}</p>
                    <p className="text-xs text-muted-foreground">{d.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.isVerified && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">Verified</Badge>}
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">View</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineItem({ label, date, status, detail }: {
  label: string; date: string; status: 'done' | 'rejected'; detail?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
        status === 'rejected' ? 'bg-red-100' : 'bg-green-100'
      }`}>
        {status === 'rejected'
          ? <ArrowRight className="h-3.5 w-3.5 text-red-600" />
          : <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  )
}
