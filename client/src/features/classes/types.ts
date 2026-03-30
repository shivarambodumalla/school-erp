export interface ClassActiveYear {
  id: string
  serialNo: number
  status: string
  sectionCount: number
  studentCount: number
}

export interface ClassTemplate {
  id: string
  name: string
  gradeLevel: number
  description: string | null
  activeYear: ClassActiveYear | null
}

export interface SectionData {
  id: string
  name: string
  maxStrength: number | null
  classTeacherId: string | null
  _count: { students: number }
}

export interface SubjectTeacher {
  user: { email: string }
  isPrimary: boolean
}

export interface SubjectData {
  id: string
  name: string
  code: string | null
  weeklyPeriods: number
  hasOnlineContent: boolean
  canPreviewFiles: boolean
  canDownloadFiles: boolean
  sectionId: string | null
  teachers: SubjectTeacher[]
}

export interface ClassYearDetail {
  id: string
  status: string
  classTemplate: { name: string; gradeLevel: number }
  academicYear: { name: string }
  sections: SectionData[]
  subjects: SubjectData[]
  _count: { sections: number; subjects: number }
}

export interface StudentEntry {
  student: {
    id: string
    firstName: string
    lastName: string
    admissionNo: string
    rollNo: string | null
    photoUrl: string | null
    serialNo: number
  }
  sectionId: string
  sectionName: string
  status: string
}

export interface PromoteStudent {
  id: string
  studentId: string
  student: {
    id: string
    firstName: string
    lastName: string
    admissionNo: string
    rollNo: string | null
    photoUrl: string | null
    serialNo: number
  }
  section: { id: string; name: string }
}
