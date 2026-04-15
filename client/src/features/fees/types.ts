export interface FeeCategory {
  id: string
  name: string
  description: string | null
  amount: string
  frequency: string
  isOptional: boolean
  applicableTo: string
  classYearIds: string[]
  sectionIds: string[]
  isActive: boolean
  order: number
  _count?: { payments: number }
}

export interface FeePaymentItem {
  id: string
  studentId: string
  feeCategoryId: string
  amount: string
  fineAmount: string
  totalAmount: string
  status: string
  method: string | null
  receiptNo: string | null
  transactionRef: string | null
  dueDate: string
  paidAt: string | null
  month: number | null
  year: number | null
  notes: string | null
  collectedById: string | null
  student?: { firstName: string; lastName: string; admissionNo: string }
  feeCategory?: { name: string; frequency?: string }
}

export interface FeeSummary {
  totalDue: number
  totalCollected: number
  totalPending: number
  totalOverdue: number
  totalWaived: number
  collectionRate: number
  overdueCount: number
  chartData: { month: string; collected: number; pending: number; overdue: number }[]
  byCategory: { categoryName: string; due: number; collected: number; pct: number }[]
}

export interface FeeConcessionItem {
  id: string
  studentId: string
  feeCategoryId: string | null
  name: string
  type: string
  amount: string
  validFrom: string
  validTill: string | null
  notes: string | null
  student?: { firstName: string; lastName: string; admissionNo?: string }
}

export interface FeeSettingsData {
  id: string
  receiptPrefix: string
  receiptCurrentSeq: number
  lateFineEnabled: boolean
  reminderEnabled: boolean
  partialPaymentAllowed: boolean
}

export { FEE_STATUS_COLORS as STATUS_COLORS } from '@/lib/colors'

export const FREQ_LABELS: Record<string, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half Yearly',
  ANNUAL: 'Annual',
  ONE_TIME: 'One Time',
}
