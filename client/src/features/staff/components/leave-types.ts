export interface LeaveRecord {
  id: string
  staffId: string
  leaveTypeId: string
  fromDate: string
  toDate: string
  totalDays: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  approvedById: string | null
  approvalComment: string | null
  appliedAt: string
  reviewedAt: string | null
  substituteArranged: boolean
  substituteStaffId: string | null
  staff?: {
    firstName: string
    lastName: string
    employeeNo: string
    department: { name: string } | null
  }
  leaveType: {
    name: string
    shortName?: string
  }
}

export interface LeaveBalance {
  leaveTypeId: string
  name: string
  shortName: string
  total: number
  used: number
  remaining: number
  carryForward: boolean
}

export type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
}
