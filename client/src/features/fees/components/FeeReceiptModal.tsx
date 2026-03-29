'use client'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, CheckCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  receiptNo: string
  totalAmount: number
}

export function FeeReceiptModal({ open, onClose, receiptNo, totalAmount }: Props) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Successful</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Receipt No: <span className="font-mono font-medium">{receiptNo}</span>
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 min-h-[44px] gap-2"
              onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            <Button className="flex-1 min-h-[44px]" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}