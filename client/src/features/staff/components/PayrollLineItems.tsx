'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface LineItem {
  label: string
  amount: number
}

export function SalaryRow({
  label, amount, bold,
}: {
  label: string; amount: number; bold?: boolean
}) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
      <span>{label}</span>
      <span>
        {amount < 0 ? '-' : ''}₹{Math.abs(amount).toLocaleString('en-IN')}
      </span>
    </div>
  )
}

export function LineSection({
  title, items, type, onAdd, onUpdate, onRemove,
}: {
  title: string
  items: LineItem[]
  type: 'allowance' | 'deduction'
  onAdd: () => void
  onUpdate: (
    type: 'allowance' | 'deduction',
    idx: number,
    field: 'label' | 'amount',
    val: string,
  ) => void
  onRemove: (type: 'allowance' | 'deduction', idx: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{title}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <Input
            placeholder="Label"
            value={item.label}
            onChange={(e) => onUpdate(type, i, 'label', e.target.value)}
            className="flex-1 min-h-[44px]"
          />
          <Input
            type="number"
            placeholder="Amount"
            value={item.amount || ''}
            onChange={(e) => onUpdate(type, i, 'amount', e.target.value)}
            className="w-28 min-h-[44px]"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(type, i)}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  )
}
