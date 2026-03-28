export type AccessLevel = 'NONE' | 'VIEW' | 'EDIT' | 'FULL'
export type PermissionScope = 'ALL' | 'OWN' | 'SECTION'

export interface Permission {
  feature: string
  access: AccessLevel
  scope: PermissionScope
}

export interface StaffRoleListItem {
  id: string
  name: string
  description: string | null
  isSystemRole: boolean
  permissions: Permission[]
  createdAt: string
  _count: { primaryStaff: number; assignments: number }
}

export interface StaffRoleDetail extends StaffRoleListItem {
  staffCount: number
}

export interface FeatureDefinition {
  key: string
  label: string
}

export interface FeatureGroup {
  label: string
  features: FeatureDefinition[]
}

export const FEATURE_GROUPS: Record<string, FeatureGroup> = {
  ACADEMIC: {
    label: 'Academic',
    features: [
      { key: 'classes', label: 'Classes & Sections' },
      { key: 'timetable', label: 'Timetable' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'syllabus', label: 'Syllabus & Lesson Plans' },
    ],
  },
  STUDENTS: {
    label: 'Students',
    features: [
      { key: 'student_profiles', label: 'Student Profiles' },
      { key: 'attendance', label: 'Attendance' },
      { key: 'grades', label: 'Gradebook & Grades' },
      { key: 'assignments', label: 'Assignments' },
      { key: 'quizzes', label: 'Quizzes & Exams' },
      { key: 'behaviour', label: 'Behaviour Log' },
      { key: 'counsellor_notes', label: 'Counsellor Notes' },
    ],
  },
  ADMISSIONS: {
    label: 'Admissions',
    features: [
      { key: 'admissions', label: 'Admissions Pipeline' },
      { key: 'enrollment', label: 'Enrollment' },
    ],
  },
  COMMUNICATION: {
    label: 'Communication',
    features: [
      { key: 'announcements', label: 'Announcements' },
      { key: 'parent_messages', label: 'Parent Messages' },
      { key: 'notifications', label: 'Notifications' },
    ],
  },
  FINANCE: {
    label: 'Finance',
    features: [{ key: 'fees', label: 'Fee Management' }],
  },
  STAFF: {
    label: 'Staff',
    features: [
      { key: 'staff_profiles', label: 'Staff Profiles' },
      { key: 'leave', label: 'Leave Management' },
      { key: 'payroll', label: 'Payroll' },
    ],
  },
  CONTENT: {
    label: 'Content',
    features: [
      { key: 'courses', label: 'Courses (LMS)' },
      { key: 'vibe', label: 'Vibe Community' },
      { key: 'documents', label: 'Documents' },
    ],
  },
  REPORTS: {
    label: 'Reports',
    features: [{ key: 'reports', label: 'Reports' }],
  },
  ADMIN: {
    label: 'Admin',
    features: [
      { key: 'roles', label: 'Roles & Permissions' },
      { key: 'settings', label: 'School Settings' },
      { key: 'audit_log', label: 'Audit Log' },
      { key: 'brand_theme', label: 'Brand & Theme' },
    ],
  },
}

export const ALL_FEATURES: FeatureDefinition[] = Object.values(
  FEATURE_GROUPS
).flatMap((g) => g.features)

export function getDefaultPermissions(): Permission[] {
  return ALL_FEATURES.map((f) => ({
    feature: f.key,
    access: 'NONE' as AccessLevel,
    scope: 'ALL' as PermissionScope,
  }))
}

export function summarizePermissions(permissions: Permission[]) {
  let full = 0
  let edit = 0
  let view = 0
  let none = 0
  for (const p of permissions) {
    if (p.access === 'FULL') full++
    else if (p.access === 'EDIT') edit++
    else if (p.access === 'VIEW') view++
    else none++
  }
  return { full, edit, view, none }
}

// ── Staff list & profile types ──

export interface StaffListItem {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  designation: string
  status: string
  joiningDate: string
  phone: string | null
  departmentId: string | null
  reportsToId: string | null
  department: { name: string } | null
  primaryRole: { name: string } | null
  user: { email: string; lastLoginAt: string | null } | null
  _count: { directReports: number }
}

export interface StaffDetailUser {
  id: string
  email: string
  lastLoginAt: string | null
}

export interface StaffDetailRelated {
  id: string
  firstName: string
  lastName: string
  designation: string
}

export interface StaffSecondaryRole {
  id: string
  staffRole: { id: string; name: string }
  assignedAt: string
}

export interface StaffClassTeaching {
  id: string
  section: { id: string; name: string }
  academicYear: { id: string; name: string }
}

export interface StaffSubjectTeaching {
  id: string
  isPrimary: boolean
  subject: {
    id: string
    name: string
    classYear: { id: string; classTemplate: { name: string } }
  }
}

export interface StaffDetail {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  designation: string
  phone: string | null
  personalEmail: string | null
  qualification: string | null
  specialization: string | null
  joiningDate: string
  status: string
  departmentId: string | null
  primaryRoleId: string | null
  reportsToId: string | null
  createdAt: string
  updatedAt: string
  user: StaffDetailUser | null
  department: { id: string; name: string } | null
  primaryRole: { id: string; name: string } | null
  reportsTo: StaffDetailRelated | null
  directReports: StaffDetailRelated[]
  secondaryRoles: StaffSecondaryRole[]
  classTeaching: StaffClassTeaching[]
  subjectTeaching: StaffSubjectTeaching[]
  _count: {
    leaves: number
    attendance: number
    salary: number
    documents: number
  }
}

export interface StaffDocumentItem {
  id: string
  documentType: string
  fileUrl: string
  fileName: string
  fileSize: number | null
  mimeType: string | null
  isVerified: boolean
  verifiedAt: string | null
  notes: string | null
  createdAt: string
}

export interface PerformanceNoteItem {
  id: string
  note: string
  rating: number | null
  isPrivate: boolean
  createdById: string
  createdAt: string
}

export interface StaffIdCardItem {
  id: string
  issuedAt: string
  validTill: string
  fileUrl: string | null
  isActive: boolean
}

export interface OrgNode {
  id: string
  firstName: string
  lastName: string
  designation: string
  departmentId: string | null
  department: { name: string } | null
  reportsToId: string | null
  directReports: OrgNode[]
}
