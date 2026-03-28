import type {
  SubjectPostType,
  AttachmentType,
  QuestionType,
  SubmissionStatus,
} from '@prisma/client'

export interface SubjectTeacherInfo {
  id: string
  isPrimary: boolean
  user: { id: string; email: string }
}

export interface SubjectDetail {
  id: string
  name: string
  code: string | null
  weeklyPeriods: number
  hasOnlineContent: boolean
  canPreviewFiles: boolean
  canDownloadFiles: boolean
  classYear: {
    id: string
    classTemplate: { id: string; name: string }
    academicYear: { id: string; name: string }
  }
  section: { id: string; name: string } | null
  teachers: SubjectTeacherInfo[]
  _count: { posts: number; gradeEntries: number }
}

export interface SubjectAttachmentData {
  id: string
  type: AttachmentType
  url: string
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
}

export interface AssignmentData {
  id: string
  dueDate: string
  totalMarks: number
  _count?: { submissions: number }
}

export interface QuizData {
  id: string
  totalMarks: number
  timeLimit: number | null
  shuffleQuestions: boolean
  showResultsAfter: boolean
  attemptsAllowed: number
  _count?: { attempts: number }
}

export interface PollData {
  id: string
  question: string
  options: string[]
  allowMultiple: boolean
  _count?: { votes: number }
}

export interface SubjectPostData {
  id: string
  subjectId: string
  type: SubjectPostType
  title: string
  description: string | null
  scheduledAt: string | null
  isPublished: boolean
  canPreview: boolean
  canDownload: boolean
  topicTag: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  attachments: SubjectAttachmentData[]
  assignment: AssignmentData | null
  quiz: QuizData | null
  poll: PollData | null
}

export interface QuizQuestionData {
  id: string
  quizId: string
  type: QuestionType
  text: string
  options: unknown
  correctAnswer: string | null
  marks: number
  order: number
  explanation: string | null
}

export interface QuizWithQuestions extends QuizData {
  questions: QuizQuestionData[]
}

export interface SubmissionData {
  id: string
  assignmentId: string
  studentId: string
  fileUrl: string | null
  notes: string | null
  submittedAt: string
  isLate: boolean
  marksObtained: number | null
  feedback: string | null
  gradedById: string | null
  gradedAt: string | null
  status: SubmissionStatus
  student: {
    id: string
    firstName: string
    lastName: string
    admissionNo: string
    rollNo: string | null
    photoUrl: string | null
  }
}

export const POST_TYPE_COLORS: Record<
  SubjectPostType,
  string
> = {
  MATERIAL: 'border-l-blue-500',
  ASSIGNMENT: 'border-l-violet-500',
  QUIZ: 'border-l-amber-500',
  POLL: 'border-l-teal-500',
  HOMEWORK: 'border-l-orange-500',
  ANNOUNCEMENT: 'border-l-green-500',
  EXAM: 'border-l-red-500',
}

export const POST_TYPE_BG: Record<
  SubjectPostType,
  string
> = {
  MATERIAL: 'bg-blue-100 text-blue-700',
  ASSIGNMENT: 'bg-violet-100 text-violet-700',
  QUIZ: 'bg-amber-100 text-amber-700',
  POLL: 'bg-teal-100 text-teal-700',
  HOMEWORK: 'bg-orange-100 text-orange-700',
  ANNOUNCEMENT: 'bg-green-100 text-green-700',
  EXAM: 'bg-red-100 text-red-700',
}
