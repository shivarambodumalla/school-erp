'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  const { iid } = useInstitutionId()
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
        `/api/school/staff/payroll?month=${month}&year=${year}${iid ? `&iid=${iid}` : ''}`,
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

  const periodLabel = `${MONTHS[month - 1]} ${year}`

  return (
    <div className="space-y-6">
      {/* Toolbar: Title left | Filter right */}
      <div className="flex items-center justify-between gap-3">
        <div className="shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{periodLabel}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-h-[44px] gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Period</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            <div className="px-3 py-2.5 border-b">
              <p className="text-sm font-medium">Select Period</p>
            </div>
            <div className="p-3 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Month</label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Year</label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[year - 1, year, year + 1].map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
