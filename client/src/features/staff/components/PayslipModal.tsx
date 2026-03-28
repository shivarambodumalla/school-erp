'use client'

import { useRef } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { PayslipContent, type PayslipData } from './PayslipContent'

interface Props {
  open: boolean
  onClose: () => void
  entry: PayslipData
  month: number
  year: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PRINT_CSS = `
  body { font-family: system-ui, sans-serif; padding: 2rem; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 6px 8px; text-align: left; border-bottom: 1px solid #eee; }
  .text-right { text-align: right; }
  .font-bold, .font-semibold { font-weight: 600; }
`

export function PayslipModal({ open, onClose, entry, month, year }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const monthLabel = MONTHS[month - 1]

  function handlePrint() {
    if (!printRef.current) return
    const pw = window.open('', '_blank')
    if (!pw) return
    pw.document.write(
      `<html><head><title>Payslip</title><style>${PRINT_CSS}</style></head>`
      + `<body>${printRef.current.innerHTML}</body></html>`,
    )
    pw.document.close()
    pw.print()
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Payslip</SheetTitle>
          <SheetDescription>{monthLabel} {year}</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <PayslipContent ref={printRef} entry={entry} monthLabel={monthLabel} year={year} />
        </div>

        <div className="mt-4">
          <Button onClick={handlePrint} className="w-full min-h-[44px]">
            <Printer className="h-4 w-4 mr-2" /> Print Payslip
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
