export interface StreamAttachment {
  id: string
  type: string
  url: string
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
}

export interface StreamAssignment {
  id: string
  dueDate: string
  totalMarks: number
  allowLateSubmission: boolean
  instructions: string | null
  submission: {
    id: string
    status: string
    submittedAt: string
    isLate: boolean
    marksObtained: number | null
    feedback: string | null
  } | null
}

export interface StreamQuiz {
  id: string
  totalMarks: number
  timeLimit: number | null
  attemptsAllowed: number
  questionCount: number
  attempt: {
    id: string
    score: number | null
    submittedAt: string | null
  } | null
}

export interface StreamPoll {
  id: string
  question: string
  options: unknown
  allowMultiple: boolean
  closedAt: string | null
  vote: {
    id: string
    optionIds: unknown
  } | null
}

export interface StreamHomework {
  id: string
  title: string
  description: string | null
  dueDate: string
  completion: {
    id: string
    isDone: boolean
  } | null
}

export interface StreamPost {
  id: string
  type: string
  title: string
  description: string | null
  topicTag: string | null
  createdAt: string
  attachments: StreamAttachment[]
  assignment: StreamAssignment | null
  quiz: StreamQuiz | null
  poll: StreamPoll | null
  homework: StreamHomework | null
}
