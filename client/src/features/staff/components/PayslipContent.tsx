'use client'

import { forwardRef } from 'react'

interface AllowanceDeduction {
  label: string
  amount: number
}

export interface PayslipData {
  name: string
  employeeNo: string
  designation: string
  dept: string | null
  basicSalary: string
  allowances: AllowanceDeduction[]
  deductions: AllowanceDeduction[]
  lopDays: number
  lopDeduction: string
  grossSalary: string
  netSalary: string
  notes: string | null
}

interface Props {
  entry: PayslipData
  monthLabel: string
  year: number
}

function fmt(val: number | string) {
  return Number(val).toLocaleString('en-IN')
}

export const PayslipContent = forwardRef<HTMLDivElement, Props>(
  function PayslipContent({ entry, monthLabel, year }, ref) {
    const allowances = (entry.allowances ?? []) as AllowanceDeduction[]
    const deductions = (entry.deductions ?? []) as AllowanceDeduction[]

    return (
      <div ref={ref} className="space-y-4 text-sm">
        <div className="border-b-2 pb-3">
          <p className="font-bold text-lg">{entry.name}</p>
          <p className="text-muted-foreground">
            {entry.employeeNo} | {entry.designation}
            {entry.dept ? ` | ${entry.dept}` : ''}
          </p>
          <p className="text-muted-foreground">
            Pay Period: {monthLabel} {year}
          </p>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left pb-2">Earnings</th>
              <th className="text-right pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td className="text-right">₹{fmt(entry.basicSalary)}</td>
            </tr>
            {allowances.map((a, i) => (
              <tr key={i}>
                <td>{a.label}</td>
                <td className="text-right">₹{fmt(a.amount)}</td>
              </tr>
            ))}
            <tr className="font-semibold border-t">
              <td>Gross Salary</td>
              <td className="text-right">₹{fmt(entry.grossSalary)}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left pb-2">Deductions</th>
              <th className="text-right pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {deductions.map((d, i) => (
              <tr key={i}>
                <td>{d.label}</td>
                <td className="text-right">₹{fmt(d.amount)}</td>
              </tr>
            ))}
            {entry.lopDays > 0 && (
              <tr>
                <td>LOP ({entry.lopDays} days)</td>
                <td className="text-right">₹{fmt(entry.lopDeduction)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="border-t-2 pt-3 flex justify-between font-bold text-base">
          <span>Net Salary</span>
          <span>₹{fmt(entry.netSalary)}</span>
        </div>

        {entry.notes && (
          <p className="text-xs text-muted-foreground">
            Notes: {entry.notes}
          </p>
        )}
      </div>
    )
  },
)
