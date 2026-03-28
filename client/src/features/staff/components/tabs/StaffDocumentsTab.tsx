'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, CheckCircle2, XCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { StaffDocumentItem } from '../../types'

export function StaffDocumentsTab({ staffId }: { staffId: string }) {
  const [docs, setDocs] = useState<StaffDocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/school/staff/${staffId}/documents`)
    if (res.ok) {
      const data = (await res.json()) as { documents: StaffDocumentItem[] }
      setDocs(data.documents)
    }
    setLoading(false)
  }, [staffId])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const toggleVerify = async (docId: string, current: boolean) => {
    const res = await fetch(
      `/api/school/staff/${staffId}/documents/${docId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !current }),
      },
    )
    if (res.ok) {
      toast.success(current ? 'Unverified' : 'Verified')
      fetchDocs()
    }
  }

  const deleteDoc = async (docId: string) => {
    const res = await fetch(
      `/api/school/staff/${staffId}/documents/${docId}`,
      { method: 'DELETE' },
    )
    if (res.ok) {
      toast.success('Document deleted')
      fetchDocs()
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No documents uploaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-4">
      {docs.map(doc => (
        <div key={doc.id}
          className="rounded-xl border p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{doc.fileName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{doc.documentType}</span>
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge variant={doc.isVerified ? 'default' : 'secondary'}>
            {doc.isVerified ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Pending</>
            )}
          </Badge>
          <Button variant="ghost" size="sm"
            onClick={() => toggleVerify(doc.id, doc.isVerified)}>
            {doc.isVerified ? 'Unverify' : 'Verify'}
          </Button>
          <Button variant="ghost" size="sm"
            className="text-destructive"
            onClick={() => deleteDoc(doc.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}
