export interface StaffSettingsData {
  id: string
  institutionId: string
  employeeNoPrefix: string
  employeeNoCurrentSeq: number
  documentTypes: string[]
}

export interface DepartmentRow {
  id: string
  institutionId: string
  name: string
  description: string | null
  hodId: string | null
  _count: { staff: number }
}

export interface LeaveTypeRow {
  id: string
  institutionId: string
  name: string
  shortName: string
  maxDaysPerYear: number
  carryForward: boolean
  isPaid: boolean
}

export interface SalaryConfigData {
  id: string
  institutionId: string
  allowanceTypes: string[]
  deductionTypes: string[]
}
