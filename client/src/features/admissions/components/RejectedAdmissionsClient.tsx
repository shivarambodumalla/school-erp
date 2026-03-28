'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface RejectedAdmission {
  id: string
  applicationNo: string
  firstName: string
  lastName: string
  rejectionReason: string | null
  rejectedAt: string | null
  appliedAt: string
}

export function RejectedAdmissionsClient() {
  const [admissions, setAdmissions] = useState<RejectedAdmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/admissions?status=REJECTED&take=200')
      .then(r => r.json())
      .then(data => setAdmissions(data.admissions ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/management/admissions"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground
            hover:text-foreground min-h-[44px]">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rejected Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {admissions.length} rejected application{admissions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : admissions.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground text-sm">
          No rejected applications
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">App No</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link href={`/management/admissions/${a.id}`}
                      className="font-medium hover:underline">
                      {a.firstName} {a.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {a.applicationNo}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                    {a.rejectionReason ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {a.rejectedAt
                      ? new Date(a.rejectedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
