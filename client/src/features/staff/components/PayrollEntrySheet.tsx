'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { LineSection, SalaryRow, type LineItem } from './PayrollLineItems'

interface Props {
  open: boolean; onClose: () => void
  staff: { staffId: string; name: string; employeeNo: string }
  month: number; year: number; onSaved: () => void
}

export function PayrollEntrySheet({ open, onClose, staff, month, year, onSaved }: Props) {
  const [basic, setBasic] = useState(0)
  const [lopDays, setLopDays] = useState(0)
  const [allowances, setAllowances] = useState<LineItem[]>([])
  const [deductions, setDeductions] = useState<LineItem[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const calc = useMemo(() => {
    const allowTotal = allowances.reduce((s, a) => s + a.amount, 0)
    const deductTotal = deductions.reduce((s, d) => s + d.amount, 0)
    const lopDeduction = Math.round((basic / 30) * lopDays * 100) / 100
    const gross = basic + allowTotal
    const net = gross - deductTotal - lopDeduction
    return { allowTotal, deductTotal, lopDeduction, gross, net }
  }, [basic, allowances, deductions, lopDays])

  function addLine(type: 'allowance' | 'deduction') {
    const item: LineItem = { label: '', amount: 0 }
    if (type === 'allowance') setAllowances([...allowances, item])
    else setDeductions([...deductions, item])
  }

  function updateLine(type: 'allowance' | 'deduction', idx: number, field: 'label' | 'amount', value: string) {
    const setter = type === 'allowance' ? setAllowances : setDeductions
    const list = type === 'allowance' ? [...allowances] : [...deductions]
    if (field === 'amount') list[idx] = { ...list[idx], amount: Number(value) || 0 }
    else list[idx] = { ...list[idx], label: value }
    setter(list)
  }

  function removeLine(type: 'allowance' | 'deduction', idx: number) {
    if (type === 'allowance') setAllowances(allowances.filter((_, i) => i !== idx))
    else setDeductions(deductions.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    if (basic <= 0) { toast.error('Basic salary required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/school/staff/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month, year,
          entries: [{
            staffId: staff.staffId,
            basicSalary: basic,
            allowances: allowances.filter((a) => a.label && a.amount > 0),
            deductions: deductions.filter((d) => d.label && d.amount > 0),
            lopDays,
            notes: notes || undefined,
          }],
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success(`Salary processed for ${staff.name}`)
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save salary')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Process Salary</SheetTitle>
          <SheetDescription>
            {staff.name} ({staff.employeeNo})
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          <div>
            <Label>Basic Salary</Label>
            <Input
              type="number" min={0}
              value={basic || ''}
              onChange={(e) => setBasic(Number(e.target.value) || 0)}
              className="min-h-[44px] mt-1"
            />
          </div>

          <LineSection title="Allowances" items={allowances} type="allowance"
            onAdd={() => addLine('allowance')} onUpdate={updateLine} onRemove={removeLine} />
          <LineSection title="Deductions" items={deductions} type="deduction"
            onAdd={() => addLine('deduction')} onUpdate={updateLine} onRemove={removeLine} />

          <div>
            <Label>LOP Days</Label>
            <Input
              type="number" min={0} max={30}
              value={lopDays || ''}
              onChange={(e) => setLopDays(Number(e.target.value) || 0)}
              className="min-h-[44px] mt-1"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)}
              className="min-h-[44px] mt-1" />
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
            <SalaryRow label="Basic" amount={basic} />
            <SalaryRow label="Allowances" amount={calc.allowTotal} />
            <SalaryRow label="Gross" amount={calc.gross} bold />
            <SalaryRow label="Deductions" amount={-calc.deductTotal} />
            <SalaryRow label={`LOP (${lopDays}d)`} amount={-calc.lopDeduction} />
            <div className="border-t pt-1 mt-1">
              <SalaryRow label="Net Salary" amount={calc.net} bold />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || basic <= 0}
            className="w-full min-h-[44px]">
            {saving ? 'Saving...' : 'Process Salary'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
