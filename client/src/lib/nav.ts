import {
    LayoutDashboard, LayoutGrid, Clock, CalendarCheck,
    CalendarDays, GraduationCap, Users, UserCheck,
    MessageCircle, CreditCard, BookOpen, Rss, Bus,
    ShieldCheck, FolderOpen, BarChart3, ClipboardList,
    Ticket, Settings, AlertTriangle,
    CalendarOff, Banknote,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PERMISSIONS, type Permission } from './permissions'

export interface NavItem {
    label: string
    path: string
    icon: LucideIcon
    permission: Permission | null  // null = always visible (dashboard)
}

export interface NavGroup {
    label: string
    items: NavItem[]
}

// Management shell navigation
export const MANAGEMENT_NAV: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', path: '/management/dashboard', icon: LayoutDashboard, permission: null },
        ],
    },
    {
        label: 'Academic',
        items: [
            { label: 'Classes', path: '/management/institution/classes', icon: LayoutGrid, permission: PERMISSIONS.STUDENTS_VIEW },
            { label: 'Timetable', path: '/management/timetable', icon: Clock, permission: PERMISSIONS.TIMETABLE_VIEW },
            { label: 'Attendance', path: '/management/attendance', icon: CalendarCheck, permission: PERMISSIONS.ATTENDANCE_VIEW },
            { label: 'Grades', path: '/management/grades', icon: GraduationCap, permission: PERMISSIONS.GRADES_VIEW },
            { label: 'Calendar', path: '/management/calendar', icon: CalendarDays, permission: PERMISSIONS.CALENDAR_VIEW },
        ],
    },
    {
        label: 'People',
        items: [
            { label: 'Admissions', path: '/management/admissions', icon: ClipboardList, permission: PERMISSIONS.STUDENTS_CREATE },
            { label: 'Students', path: '/management/students', icon: Users, permission: PERMISSIONS.STUDENTS_VIEW },
            { label: 'Staff', path: '/management/staff', icon: UserCheck, permission: PERMISSIONS.STAFF_VIEW },
            { label: 'Communications', path: '/management/communications', icon: MessageCircle, permission: PERMISSIONS.COMMUNICATIONS_VIEW },
        ],
    },
    {
        label: 'Finance',
        items: [
            { label: 'Fees', path: '/management/fees', icon: CreditCard, permission: PERMISSIONS.FEES_VIEW },
            { label: 'Payroll', path: '/management/staff/payroll', icon: Banknote, permission: PERMISSIONS.STAFF_MANAGE },
        ],
    },
    {
        label: 'Platform',
        items: [
            { label: 'Courses', path: '/management/courses', icon: BookOpen, permission: PERMISSIONS.COURSES_VIEW },
            { label: 'Vibe', path: '/management/vibe', icon: Rss, permission: PERMISSIONS.VIBE_VIEW },
            { label: 'Bus Tracking', path: '/management/bus', icon: Bus, permission: PERMISSIONS.BUS_VIEW },
        ],
    },
    {
        label: 'Admin',
        items: [
            { label: 'Leave Requests', path: '/management/staff/leaves', icon: CalendarOff, permission: PERMISSIONS.STAFF_MANAGE },
            { label: 'Roles', path: '/management/staff/roles', icon: ShieldCheck, permission: PERMISSIONS.ROLES_VIEW },
            { label: 'Documents', path: '/management/documents', icon: FolderOpen, permission: PERMISSIONS.DOCUMENTS_VIEW },
            { label: 'Reports', path: '/management/reports', icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
            { label: 'Audit Log', path: '/management/audit', icon: ClipboardList, permission: PERMISSIONS.AUDIT_VIEW },
            { label: 'Support', path: '/management/tickets', icon: Ticket, permission: PERMISSIONS.TICKETS_VIEW },
            { label: 'Risk Signals', path: '/management/risk', icon: AlertTriangle, permission: PERMISSIONS.SETTINGS_VIEW },
            { label: 'Settings', path: '/management/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
        ],
    },
]

// Consumer shell bottom tabs
export const PARENT_TABS: NavItem[] = [
    { label: 'Home', path: '/consumer/dashboard', icon: LayoutDashboard, permission: null },
    { label: 'Bus', path: '/consumer/bus', icon: Bus, permission: PERMISSIONS.BUS_VIEW },
    { label: 'Fees', path: '/consumer/fees', icon: CreditCard, permission: PERMISSIONS.FEES_VIEW },
    { label: 'Grades', path: '/consumer/grades', icon: GraduationCap, permission: PERMISSIONS.GRADES_VIEW },
    { label: 'Chat', path: '/consumer/chat', icon: MessageCircle, permission: null },
]

export const STUDENT_TABS: NavItem[] = [
    { label: 'Home', path: '/consumer/dashboard', icon: LayoutDashboard, permission: null },
    { label: 'Subjects', path: '/consumer/subjects', icon: BookOpen, permission: null },
    { label: 'Grades', path: '/consumer/grades', icon: GraduationCap, permission: PERMISSIONS.GRADES_VIEW },
    { label: 'Homework', path: '/consumer/homework', icon: ClipboardList, permission: null },
    { label: 'Profile', path: '/consumer/profile', icon: Users, permission: null },
]

// Filter nav items based on user permissions
export function getAuthorisedNav(
    groups: NavGroup[],
    userPermissions: Permission[]
): NavGroup[] {
    return groups
        .map((group) => ({
            ...group,
            items: group.items.filter(
                (item) => item.permission === null || userPermissions.includes(item.permission)
            ),
        }))
        .filter((group) => group.items.length > 0)
}
