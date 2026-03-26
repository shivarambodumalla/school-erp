export interface OverviewStats {
  userCount: number
  studentCount: number
  classCount: number
  openTickets: number
}

export interface UserBreakdownItem {
  role: string
  count: number
}

export interface OnboardingStatus {
  classesAdded: boolean
  staffAdded: boolean
  studentsAdded: boolean
  completedAt: string | null
}

export interface LoginActivityPoint {
  date: string
  logins: number
}

export interface RiskSignal {
  type: string
  severity: 'critical' | 'warning'
  title: string
}

export interface InstitutionDetails {
  id: string
  name: string
  subdomain: string
  board: string
  planTier: string
  primaryColor: string
  city: string | null
  state: string | null
  phone: string | null
  website: string | null
  createdAt: string
  isActive: boolean
  institutionType: string
}

export interface OverviewData {
  institution: InstitutionDetails
  stats: OverviewStats
  userBreakdown: UserBreakdownItem[]
  onboarding: OnboardingStatus | null
  loginActivity: LoginActivityPoint[]
  riskSignals: RiskSignal[]
}
