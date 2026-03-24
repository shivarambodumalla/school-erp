'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, FileText, Download, ShieldCheck } from 'lucide-react'
import { UploadDocumentForm } from './UploadDocumentForm'

interface Document {
    id: string
    name: string
    type: string
    fileUrl: string
    fileSize: number
    mimeType: string
    isVerified: boolean
    createdAt: Date
    studentId: string | null
    uploadedById: string
}

interface Props {
    documents: Document[]
    institutionId: string
}

const TYPE_LABELS: Record<string, string> = {
    TRANSFER_CERTIFICATE: 'TC',
    ADMISSION_FORM: 'Admission',
    MARKSHEET: 'Marksheet',
    ID_PROOF: 'ID Proof',
    MEDICAL_RECORD: 'Medical',
    STAFF_CONTRACT: 'Contract',
    OTHER: 'Other',
}

const TYPE_FILTERS = ['ALL', ...Object.keys(TYPE_LABELS)] as const

export function DocumentsClient({ documents, institutionId }: Props) {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('ALL')
    const [showUpload, setShowUpload] = useState(false)

    const filtered = documents.filter((doc) => {
        const matchesSearch = search === '' || doc.name.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === 'ALL' || doc.type === typeFilter
        return matchesSearch && matchesType
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Documents</h1>
                    <p className="text-muted-foreground text-sm mt-1">{documents.length} documents</p>
                </div>
                <Button size="sm" onClick={() => setShowUpload(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Upload Document
                </Button>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                typeFilter === t
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {t === 'ALL' ? 'ALL' : TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((doc) => (
                    <div key={doc.id} className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {doc.isVerified && (
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-sm line-clamp-2">{doc.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                                {TYPE_LABELS[doc.type] ?? doc.type}
                            </Badge>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No documents found</p>
                </div>
            )}

            {showUpload && (
                <UploadDocumentForm institutionId={institutionId} onClose={() => setShowUpload(false)} />
            )}
        </div>
    )
}
