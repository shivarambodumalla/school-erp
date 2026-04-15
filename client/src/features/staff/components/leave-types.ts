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

export { LEAVE_STATUS_COLORS as STATUS_COLORS } from '@/lib/colors'
