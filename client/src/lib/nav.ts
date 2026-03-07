import {
    LayoutDashboard, Users, CreditCard, CalendarCheck,
    BookOpen, BarChart3, Settings, GraduationCap,
    Clock, Bus, MessageCircle, Sparkles, ShieldCheck,
    Rss,
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
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: null },
        ],
    },
    {
        label: 'Academic',
        items: [
            { label: 'Students', path: '/students', icon: Users, permission: PERMISSIONS.STUDENTS_VIEW },
            { label: 'Attendance', path: '/attendance', icon: CalendarCheck, permission: PERMISSIONS.ATTENDANCE_VIEW },
            { label: 'Timetable', path: '/timetable', icon: Clock, permission: PERMISSIONS.TIMETABLE_VIEW },
            { label: 'Grades', path: '/grades', icon: GraduationCap, permission: PERMISSIONS.GRADES_VIEW },
        ],
    },
    {
        label: 'Finance',
        items: [
            { label: 'Fees', path: '/fees', icon: CreditCard, permission: PERMISSIONS.FEES_VIEW },
        ],
    },
    {
        label: 'People',
        items: [
            { label: 'Users', path: '/management/users', icon: Users, permission: PERMISSIONS.STUDENTS_VIEW },
            { label: 'Staff', path: '/staff', icon: Users, permission: PERMISSIONS.STAFF_VIEW },
        ],
    },
    {
        label: 'Platform',
        items: [
            { label: 'Courses', path: '/courses', icon: BookOpen, permission: PERMISSIONS.COURSES_VIEW },
            { label: 'Vibe', path: '/vibe', icon: Rss, permission: PERMISSIONS.VIBE_VIEW },
            { label: 'Bus Tracking', path: '/bus', icon: Bus, permission: PERMISSIONS.BUS_VIEW },
            { label: 'AI Tools', path: '/ai', icon: Sparkles, permission: PERMISSIONS.AI_INSIGHTS },
            { label: 'Reports', path: '/reports', icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
        ],
    },
    {
        label: 'Admin',
        items: [
            { label: 'All Users', path: '/management/admin/users', icon: Users, permission: PERMISSIONS.ROLES_MANAGE },
            { label: 'Roles', path: '/roles', icon: ShieldCheck, permission: PERMISSIONS.ROLES_VIEW },
            { label: 'Settings', path: '/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
        ],
    },
]

// Consumer shell bottom tabs
export const PARENT_TABS: NavItem[] = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard, permission: null },
    { label: 'Bus', path: '/bus', icon: Bus, permission: PERMISSIONS.BUS_VIEW },
    { label: 'Fees', path: '/fees', icon: CreditCard, permission: PERMISSIONS.FEES_VIEW },
    { label: 'Grades', path: '/grades', icon: GraduationCap, permission: PERMISSIONS.GRADES_VIEW },
    { label: 'Chat', path: '/chat', icon: MessageCircle, permission: null },
]

export const STUDENT_TABS: NavItem[] = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard, permission: null },
    { label: 'Courses', path: '/courses', icon: BookOpen, permission: PERMISSIONS.COURSES_VIEW },
    { label: 'Grades', path: '/grades', icon: GraduationCap, permission: PERMISSIONS.GRADES_VIEW },
    { label: 'Vibe', path: '/vibe', icon: Rss, permission: PERMISSIONS.VIBE_VIEW },
    { label: 'Profile', path: '/profile', icon: Users, permission: null },
]

// Filter nav items based on user permissions
export function getAuthorisedNav(
    groups: NavGroup[],
    userPermissions: Permission[]
): NavGroup[] {
    return groups
        .map(group => ({
            ...group,
            items: group.items.filter(
                item => item.permission === null ||
                    userPermissions.includes(item.permission)
            ),
        }))
        .filter(group => group.items.length > 0)
}
