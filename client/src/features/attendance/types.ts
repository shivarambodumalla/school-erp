export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'EXCUSED'

export type AttendanceMode = 'DAILY' | 'PERIOD' | 'BOTH'

export interface AttendanceStudent {
  studentId: string
  firstName: string
  lastName: string
  rollNo: string | null
  status: AttendanceStatus | null
  notes: string | null
}

export interface AttendanceData {
  mode: AttendanceMode
  date: string
  alreadyMarked: boolean
  students: AttendanceStudent[]
}

export interface SectionOption {
  id: string
  name: string
  classYearId: string
  className: string
}

export interface SummaryStudent {
  studentId: string
  firstName: string
  lastName: string
  rollNo: string | null
  PRESENT: number
  ABSENT: number
  LATE: number
  HALF_DAY: number
  EXCUSED: number
  total: number
  percentage: number
}

export interface HeatmapDay {
  date: string
  status: AttendanceStatus
}
