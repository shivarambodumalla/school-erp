'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  acting: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

export function RejectModal({ acting, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Reject Application</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label>Reason *</Label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background
              px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1
              focus:ring-primary"
            placeholder="Provide a reason for rejection..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || acting}>
            {acting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}
