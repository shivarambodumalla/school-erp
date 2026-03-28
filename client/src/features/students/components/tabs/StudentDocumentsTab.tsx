'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Download, Trash2, Upload, CheckCircle, AlertCircle,
  X, Loader2, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface UploadedDoc {
  id: string; documentTypeConfigId: string | null; documentTypeName: string
  fileUrl: string; fileName: string; fileSize: number | null
  mimeType: string | null; isVerified: boolean; verifiedAt: string | null
  notes: string | null; createdAt: string
}

interface DocType {
  id: string; name: string; isRequired: boolean
  acceptedFormats: string[]; order: number
  uploadedDoc: UploadedDoc | null
}

interface Props {
  studentId: string
  isAdmin: boolean
}

export function StudentDocumentsTab({ studentId, isAdmin }: Props) {
  const [docTypes, setDocTypes] = useState<DocType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadFor, setUploadFor] = useState<DocType | null>(null)

  const fetchDocs = useCallback(() => {
    fetch(`/api/school/students/${studentId}/documents`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then(d => setDocTypes(d.docTypes ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  async function handleDelete(docId: string) {
    if (!confirm('Delete this document?')) return
    const res = await fetch(
      `/api/school/students/${studentId}/documents/${docId}`,
      { method: 'DELETE' },
    )
    if (res.ok) { toast.success('Document deleted'); fetchDocs() }
    else toast.error('Failed to delete')
  }

  async function handleVerify(docId: string, verified: boolean) {
    const res = await fetch(
      `/api/school/students/${studentId}/documents/${docId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verified }),
      },
    )
    if (res.ok) { toast.success(verified ? 'Verified' : 'Unverified'); fetchDocs() }
  }

  if (loading) return <DocsSkeleton />
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Documents</h3>
        {isAdmin && (
          <Button size="sm" className="min-h-[44px]"
            onClick={() => setUploadFor(docTypes.find(d => !d.uploadedDoc) ?? null)}>
            <Upload className="h-4 w-4 mr-1" /> Upload
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {docTypes.map(dt => (
          <div key={dt.id} className="rounded-lg border p-3 flex items-center
            justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{dt.name}</span>
                {dt.isRequired && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100
                    text-red-700">Required</span>
                )}
              </div>
              {dt.uploadedDoc ? (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {dt.uploadedDoc.fileName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(dt.uploadedDoc.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  {dt.uploadedDoc.isVerified ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded
                      bg-green-100 text-green-700 flex items-center gap-0.5">
                      <CheckCircle className="h-2.5 w-2.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded
                      bg-amber-100 text-amber-700">Pending</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">Not uploaded</p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {dt.uploadedDoc && (
                <>
                  <button
                    onClick={() => window.open(dt.uploadedDoc!.fileUrl, '_blank')}
                    className="p-2 rounded hover:bg-muted min-h-[44px] min-w-[44px]
                      flex items-center justify-center"
                    title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleVerify(
                          dt.uploadedDoc!.id, !dt.uploadedDoc!.isVerified,
                        )}
                        className="p-2 rounded hover:bg-muted min-h-[44px] min-w-[44px]
                          flex items-center justify-center"
                        title={dt.uploadedDoc.isVerified ? 'Unverify' : 'Verify'}>
                        <ShieldCheck className={`h-4 w-4 ${
                          dt.uploadedDoc.isVerified ? 'text-green-600' : 'text-muted-foreground'
                        }`} />
                      </button>
                      <button
                        onClick={() => handleDelete(dt.uploadedDoc!.id)}
                        className="p-2 rounded hover:bg-red-100 text-red-500
                          min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              )}
              {!dt.uploadedDoc && isAdmin && (
                <Button variant="outline" size="sm" className="min-h-[44px]"
                  onClick={() => setUploadFor(dt)}>
                  <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                </Button>
              )}
            </div>
          </div>
        ))}

        {docTypes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">No document types configured</p>
          </div>
        )}
      </div>

      {uploadFor && (
        <UploadDocumentSheet
          studentId={studentId}
          docType={uploadFor}
          onClose={() => setUploadFor(null)}
          onUploaded={() => { setUploadFor(null); fetchDocs() }}
        />
      )}
    </div>
  )
}

/* Upload sheet */
function UploadDocumentSheet({ studentId, docType, onClose, onUploaded }: {
  studentId: string; docType: DocType
  onClose: () => void; onUploaded: () => void
}) {
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!fileUrl || !fileName) return
    setSaving(true)
    const res = await fetch(`/api/school/students/${studentId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentTypeConfigId: docType.id,
        documentTypeName: docType.name,
        fileUrl, fileName, notes: notes || undefined,
      }),
    })
    setSaving(false)
    if (res.ok) { toast.success('Document uploaded'); onUploaded() }
    else { const d = await res.json(); toast.error(d.error ?? 'Failed') }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="bg-background w-full max-w-sm h-full border-l shadow-xl
        flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Upload Document</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Document Type</Label>
            <Input value={docType.name} disabled className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label>File URL *</Label>
            <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)}
              placeholder="https://..." className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label>File Name *</Label>
            <Input value={fileName} onChange={e => setFileName(e.target.value)}
              placeholder="document.pdf" className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} className="w-full rounded-md border border-input bg-background
                px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1
                focus:ring-primary" />
          </div>
        </div>
        <div className="p-4 border-t">
          <Button className="w-full min-h-[44px]" onClick={handleSubmit}
            disabled={!fileUrl || !fileName || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Upload
          </Button>
        </div>
      </div>
    </div>
  )
}

function DocsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="h-9 w-20 bg-muted rounded" />
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-16 rounded-lg bg-muted" />
      ))}
    </div>
  )
}
