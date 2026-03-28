export interface ExamTypeRow {
  id: string
  name: string
  shortName: string
  countInFinalGrade: boolean
  weightage: number
  order: number
}

export interface GradeCellData {
  marksObtained: number
  totalMarks: number
  gradeLetter: string | null
  isIncludedInFinal: boolean
  notes: string | null
}

export interface StudentGradeRow {
  studentId: string
  firstName: string
  lastName: string
  rollNo: string | null
  grades: Record<string, GradeCellData | null>
  totalObtained: number
  totalMax: number
  percentage: number
  overallGrade: string | null
  rank: number
}

export interface GradebookData {
  subject: {
    id: string
    name: string
    code: string | null
    classYearId: string
    sectionId: string | null
  }
  examTypes: ExamTypeRow[]
  students: StudentGradeRow[]
}

export interface SubjectSummary {
  obtained: number
  max: number
  percentage: number
  grade: string | null
}

export interface ClassStudentRow {
  studentId: string
  firstName: string
  lastName: string
  rollNo: string | null
  sectionName: string
  subjectSummaries: Record<string, SubjectSummary>
  overallPercentage: number
  overallGrade: string | null
}

export interface ClassGradebookData {
  subjects: { id: string; name: string; code: string | null }[]
  students: ClassStudentRow[]
}
