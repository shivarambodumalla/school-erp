// ─── LMS Module & Item types ───
// These mirror the Prisma schema models that Agent E adds.
// Keep in sync once the schema is finalized.

export type ModuleItemType =
  | 'LINK'
  | 'TEXT'
  | 'FILE'
  | 'VIDEO'
  | 'ASSIGNMENT'
  | 'QUIZ'
  | 'DISCUSSION'
  | 'LIVE_CLASS'
  | 'ANNOUNCEMENT'

export interface SubjectModule {
  id: string
  subjectId: string
  title: string
  order: number
  isPublished: boolean
  isLocked: boolean
  createdAt: string
  updatedAt: string
  items: SubjectModuleItem[]
  _count: { items: number }
}

export interface SubjectModuleItem {
  id: string
  moduleId: string
  type: ModuleItemType
  title: string
  description: string | null
  order: number
  isPublished: boolean
  scheduledAt: string | null
  topicTag: string | null

  // Type-specific fields (only relevant fields populated)
  url: string | null
  openInNewTab: boolean
  content: string | null
  fileUrl: string | null
  fileName: string | null
  canPreview: boolean
  canDownload: boolean
  estimatedMinutes: number | null
  videoDuration: number | null
  dueDate: string | null
  totalMarks: number | null
  instructions: string | null
  allowLateSubmission: boolean
  maxAttempts: number | null
  rubricId: string | null
  isGroupAssignment: boolean
  enableSimilarityCheck: boolean
  prompt: string | null
  allowAnonymous: boolean
  closeDate: string | null
  platform: string | null
  meetUrl: string | null
  agenda: string | null
  isUrgent: boolean
  isPinned: boolean
  expiresAt: string | null

  createdAt: string
  updatedAt: string
}

export interface StudentModuleItemProgress {
  id: string
  studentId: string
  moduleItemId: string
  isCompleted: boolean
  completedAt: string | null
}

export interface StudentNote {
  id: string
  studentId: string
  moduleItemId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface ModuleWithProgress extends SubjectModule {
  completedCount: number
  totalCount: number
}

export interface AnnouncementItem {
  id: string
  title: string
  content: string | null
  isUrgent: boolean
  isPinned: boolean
  expiresAt: string | null
  createdAt: string
  isRead: boolean
}

// ─── Item type display config ───

export const ITEM_TYPE_CONFIG: Record<
  ModuleItemType,
  { label: string; color: string; bgColor: string }
> = {
  VIDEO: {
    label: 'Video',
    color: 'text-red-600',
    bgColor: 'bg-red-50 text-red-700',
  },
  FILE: {
    label: 'File',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 text-blue-700',
  },
  TEXT: {
    label: 'Text',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 text-gray-700',
  },
  LINK: {
    label: 'Link',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 text-cyan-700',
  },
  ASSIGNMENT: {
    label: 'Assignment',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 text-violet-700',
  },
  QUIZ: {
    label: 'Quiz',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 text-amber-700',
  },
  DISCUSSION: {
    label: 'Discussion',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 text-teal-700',
  },
  LIVE_CLASS: {
    label: 'Live Class',
    color: 'text-green-600',
    bgColor: 'bg-green-50 text-green-700',
  },
  ANNOUNCEMENT: {
    label: 'Announcement',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 text-orange-700',
  },
}
