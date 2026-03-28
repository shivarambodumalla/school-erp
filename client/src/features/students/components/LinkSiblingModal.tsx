'use client'

import { useState } from 'react'
import { Link2, Loader2, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchResult {
    id: string
    firstName: string
    lastName: string
    admissionNo: string
    class: { name: string }
}

interface Props {
    studentId: string
    onClose: () => void
}

export function LinkSiblingModal({ studentId, onClose }: Props) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [linking, setLinking] = useState(false)

    async function handleSearch() {
        if (!query.trim()) return
        setSearching(true)
        try {
            const res = await fetch(`/api/school/students?search=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                setResults((data.students ?? data).filter((s: SearchResult) => s.id !== studentId))
            }
        } catch {
            toast.error('Search failed')
        }
        setSearching(false)
    }

    async function handleLink(siblingId: string) {
        setLinking(true)
        const res = await fetch(`/api/school/students/${studentId}/siblings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siblingId }),
        })
        if (res.ok) {
            toast.success('Sibling linked')
            onClose()
        } else {
            const err = await res.json()
            toast.error(err.error ?? 'Failed to link sibling')
        }
        setLinking(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Link Sibling</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex gap-2">
                    <Input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by name or admission no..."
                        className="min-h-[44px]"
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={searching} size="sm" className="min-h-[44px]">
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
                {results.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {results.map(s => (
                            <div key={s.id}
                                className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50"
                            >
                                <div>
                                    <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {s.admissionNo} · {s.class?.name}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleLink(s.id)}
                                    disabled={linking}>
                                    <Link2 className="h-3.5 w-3.5 mr-1" />
                                    Link
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    )
}
