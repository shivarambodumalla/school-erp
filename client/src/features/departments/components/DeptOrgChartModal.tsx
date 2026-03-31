'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Portal } from '@/components/ui/portal'
import { DeptOrgChartTab } from './tabs/DeptOrgChartTab'
import type { Department } from '../types'

interface Props {
  department: Department | null
  isOpen: boolean
  onClose: () => void
}

export function DeptOrgChartModal({ department, isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !department) return null

  const chartDept = {
    color: department.color,
    hodId: department.hodId,
    deputyHodId: department.deputyHodId,
    hod: department.hod,
    deputyHod: department.deputyHod,
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-3xl w-full mx-auto rounded-xl bg-card border shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold truncate">{department.name} — Org Chart</h2>
          <button type="button" onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <DeptOrgChartTab department={chartDept} staff={[]} />
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Close</Button>
        </div>
      </div>
      </div>
    </Portal>
  )
}
