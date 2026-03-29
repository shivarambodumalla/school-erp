'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FeeConcessionItem } from '../../types'
import { AddConcessionSheet } from '../AddConcessionSheet'

export function FeeConcessionsTab() {
  const { addParams, apiParam } = useInstitutionId()
  const [concessions, setConcessions] = useState<FeeConcessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const sp = new URLSearchParams()
    addParams(sp)
    const res = await fetch(`/api/school/fees/concessions?${sp}`)
    if (res.ok) setConcessions(await res.json())
    setLoading(false)
  }, [addParams])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this concession?')) return
    const res = await fetch(`/api/school/fees/concessions/${id}${apiParam}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Concession removed'); fetchData() }
    else toast.error('Failed to remove')
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Fee Concessions</h3>
        <Button onClick={() => setAddOpen(true)} className="min-h-[44px] gap-2">
          <Plus className="h-4 w-4" /> Add Concession
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : concessions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No concessions configured</p>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Student</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Valid From</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Valid Till</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {concessions.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {c.student ? `${c.student.firstName} ${c.student.lastName}` : '-'}
                  </td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={c.type === 'FIXED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                      {c.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.type === 'PERCENTAGE' ? `${Number(c.amount)}%` : `₹${Number(c.amount).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(c.validFrom).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.validTill ? new Date(c.validTill).toLocaleDateString() : 'Ongoing'}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive"
                      onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddConcessionSheet open={addOpen} onClose={() => setAddOpen(false)} onCreated={fetchData} />
    </div>
  )
}