'use client'

import { useEffect, useState, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PayrollSummaryCards } from './PayrollSummaryCards'
import { PayrollStaffList } from './PayrollStaffList'
import { PayrollEntrySheet } from './PayrollEntrySheet'
import { PayslipModal } from './PayslipModal'

interface ProcessedEntry {
  id: string
  staffId: string
  name: string
  employeeNo: string
  designation: string
  dept: string | null
  basicSalary: string
  allowances: { label: string; amount: number }[]
  deductions: { label: string; amount: number }[]
  lopDays: number
  lopDeduction: string
  grossSalary: string
  netSalary: string
  paidAt: string | null
  payslipUrl: string | null
  notes: string | null
}

interface UnprocessedEntry {
  staffId: string
  name: string
  employeeNo: string
  designation: string
  dept: string | null
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function PayrollClient() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [processed, setProcessed] = useState<ProcessedEntry[]>([])
  const [unprocessed, setUnprocessed] = useState<UnprocessedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<UnprocessedEntry | null>(null)
  const [viewPayslip, setViewPayslip] = useState<ProcessedEntry | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/staff/payroll?month=${month}&year=${year}`,
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProcessed(data.processed)
      setUnprocessed(data.unprocessed)
    } catch {
      toast.error('Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPayout = processed.reduce(
    (sum, p) => sum + Number(p.netSalary), 0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Process and manage staff salaries
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-36 min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-24 min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <PayrollSummaryCards
            totalStaff={processed.length + unprocessed.length}
            processedCount={processed.length}
            pendingCount={unprocessed.length}
            totalPayout={totalPayout}
          />
          <PayrollStaffList
            unprocessed={unprocessed}
            processed={processed}
            onSelectUnprocessed={setSelectedStaff}
            onSelectProcessed={setViewPayslip}
          />
        </>
      )}

      {selectedStaff && (
        <PayrollEntrySheet
          open
          onClose={() => setSelectedStaff(null)}
          staff={selectedStaff}
          month={month}
          year={year}
          onSaved={fetchData}
        />
      )}

      {viewPayslip && (
        <PayslipModal
          open
          onClose={() => setViewPayslip(null)}
          entry={viewPayslip}
          month={month}
          year={year}
        />
      )}
    </div>
  )
}
