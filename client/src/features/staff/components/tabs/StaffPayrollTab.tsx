'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PayslipModal } from '../PayslipModal'

interface SalaryRecord {
  id: string
  month: number
  year: number
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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

interface Props {
  staffId: string
  staffName: string
  employeeNo: string
  designation: string
}

export function StaffPayrollTab({ staffId, staffName, employeeNo, designation }: Props) {
  const [records, setRecords] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewPayslip, setViewPayslip] = useState<SalaryRecord | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/staff/${staffId}/payroll`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRecords(data.salaries)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [staffId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No salary records found</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Basic</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">LOP</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {MONTHS[r.month - 1]} {r.year}
                </TableCell>
                <TableCell className="text-right">
                  ₹{Number(r.basicSalary).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right">
                  ₹{Number(r.grossSalary).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{Number(r.netSalary).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {r.lopDays}d
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewPayslip(r)}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {viewPayslip && (
        <PayslipModal
          open
          onClose={() => setViewPayslip(null)}
          entry={{
            name: staffName,
            employeeNo,
            designation,
            dept: null,
            basicSalary: viewPayslip.basicSalary,
            allowances: viewPayslip.allowances,
            deductions: viewPayslip.deductions,
            lopDays: viewPayslip.lopDays,
            lopDeduction: viewPayslip.lopDeduction,
            grossSalary: viewPayslip.grossSalary,
            netSalary: viewPayslip.netSalary,
            notes: viewPayslip.notes,
          }}
          month={viewPayslip.month}
          year={viewPayslip.year}
        />
      )}
    </>
  )
}
