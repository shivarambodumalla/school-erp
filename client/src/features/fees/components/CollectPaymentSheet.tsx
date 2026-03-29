'use client'

import { useState, useMemo } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { FeePaymentItem } from '../types'

const METHODS = ['CASH', 'UPI', 'CARD', 'CHEQUE', 'NEFT']

interface Props {
  open: boolean
  onClose: () => void
  payment: FeePaymentItem
  studentName: string
  onCollected: (data: { receiptNo: string; totalAmount: number }) => void
}

export function CollectPaymentSheet({ open, onClose, payment, studentName, onCollected }: Props) {
  const { apiParam } = useInstitutionId()
  const [method, setMethod] = useState('CASH')
  const [fineAmount, setFineAmount] = useState(Number(payment.fineAmount))
  const [transactionRef, setTransactionRef] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const amount = Number(payment.amount)
  const total = useMemo(() => Math.max(0, amount + fineAmount), [amount, fineAmount])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/school/fees/payments${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          studentId: payment.studentId,
          feeCategoryId: payment.feeCategoryId,
          amount,
          method,
          month: payment.month,
          year: payment.year,
          transactionRef: transactionRef || undefined,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) { toast.error('Payment failed'); return }
      const data = await res.json() as { receiptNo: string; totalAmount: number }
      toast.success(`Payment collected — Receipt ${data.receiptNo}`)
      onCollected(data)
      onClose()
    } catch { toast.error('Failed to process payment') }
    finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>Collect Payment</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-muted/30 p-3 text-sm">
            <p className="font-medium">{studentName}</p>
            <p className="text-muted-foreground">{payment.feeCategory?.name}</p>
          </div>

          <div>
            <Label>Fee Amount</Label>
            <Input value={`₹${amount.toLocaleString('en-IN')}`} disabled className="min-h-[44px] mt-1" />
          </div>
          <div>
            <Label>Fine Amount</Label>
            <Input type="number" min={0} value={fineAmount || ''}
              onChange={e => setFineAmount(Number(e.target.value) || 0)} className="min-h-[44px] mt-1" />
          </div>

          <div className="rounded-lg border bg-primary/5 p-3 flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <div>
            <Label>Payment Method *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {METHODS.map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium min-h-[44px] transition-colors ${
                    method === m ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          {['UPI', 'CARD', 'NEFT'].includes(method) && (
            <div>
              <Label>Transaction Reference</Label>
              <Input value={transactionRef} onChange={e => setTransactionRef(e.target.value)}
                placeholder="Transaction ID" className="min-h-[44px] mt-1" />
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[44px] mt-1" />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full min-h-[44px]">
            {saving ? 'Processing...' : `Collect ₹${total.toLocaleString('en-IN')}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
