import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import {
    ArrowRight,
    Users,
    GraduationCap,
    CreditCard,
    ClipboardList,
    BarChart3,
    Trophy,
    Megaphone,
    Calendar,
    BookOpen,
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Onflows — Your school. In flow.',
    description:
        'The all-in-one School ERP + LMS + Community platform. Streamline admissions, attendance, fees, grades, communications, and more — built for modern schools.',
    openGraph: {
        title: 'Onflows — Your school. In flow.',
        description:
            'Multi-tenant School ERP + LMS + Community platform for modern schools.',
        url: 'https://onflows.app',
        siteName: 'Onflows',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Onflows — Your school. In flow.',
        description:
            'The all-in-one School ERP + LMS + Community platform.',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://onflows.app' },
}

const features = [
    {
        icon: ClipboardList,
        title: 'Admissions & Leads CRM',
        description:
            'Public enquiry forms, lead pipeline, follow-ups with WhatsApp, merit lists, and conversion analytics.',
    },
    {
        icon: Users,
        title: 'Student & Staff Management',
        description:
            'Complete profiles, guardians, roles, departments, attendance, and payroll — all in one place.',
    },
    {
        icon: GraduationCap,
        title: 'Grades & Report Cards',
        description:
            'Exam types, gradebooks, attendance-aware report cards with print-ready PDF generation.',
    },
    {
        icon: CreditCard,
        title: 'Fees & Finance',
        description:
            'Fee categories, payments, concessions, fines, and automated reminders with parent notifications.',
    },
    {
        icon: BookOpen,
        title: 'Courses & LMS',
        description:
            'Modules, assignments, quizzes, rubrics, discussions, and live classes — a full learning platform.',
    },
    {
        icon: Megaphone,
        title: 'Circulars & Communications',
        description:
            'Targeted announcements, parent-staff messaging, and WhatsApp templates for school-wide updates.',
    },
    {
        icon: Trophy,
        title: 'Kudos & Recognition',
        description:
            'Teachers give badges, students earn points, parents get notified — positive reinforcement built-in.',
    },
    {
        icon: Calendar,
        title: 'Timetable & Calendar',
        description:
            'Weekly schedules, substitutions, school events, and academic year switching across all data.',
    },
    {
        icon: BarChart3,
        title: 'Reports & Analytics',
        description:
            'Fee collection, attendance trends, conversion funnels, and exportable reports for leadership.',
    },
]

export default function HomePage(): JSX.Element {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* ── Nav ───────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/logo-square.svg"
                            alt="Onflows"
                            width={32}
                            height={32}
                            priority
                        />
                        <span className="text-lg font-semibold tracking-tight">
                            Onflows
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/enquire/stmarys"
                            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                        >
                            Demo Enquiry
                        </Link>
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                className="min-h-[40px] px-3 text-sm sm:px-4"
                            >
                                Sign in
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button className="min-h-[40px] px-3 text-sm sm:px-4">
                                Get Started
                                <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        Built for modern Indian schools
                    </div>

                    <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                        Your school.
                        <br />
                        <span className="text-primary">In flow.</span>
                    </h1>

                    <p className="text-balance mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        The all-in-one School ERP + LMS + Community platform.
                        Streamline admissions, attendance, fees, grades, and
                        communications — so your staff can focus on teaching.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link href="/auth/login" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="min-h-[48px] w-full px-6 sm:w-auto"
                            >
                                Sign in to your school
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link
                            href="/enquire/stmarys"
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                className="min-h-[48px] w-full px-6 sm:w-auto"
                            >
                                See enquiry form demo
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-muted-foreground">
                        Multi-tenant · Mobile-first · Role-based access ·
                        Audit-logged
                    </p>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Everything a school runs on
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                            One platform. Every module. Zero spreadsheets.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm sm:p-6"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── Stats band ────────────────────────────────────── */}
            <section className="border-t border-border/60 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
                        {[
                            { label: 'Modules', value: '20+' },
                            { label: 'User roles', value: '5' },
                            { label: 'Tenant-isolated', value: '100%' },
                            { label: 'Mobile-first', value: 'PWA' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                                    {stat.value}
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────── */}
            <section className="border-t border-border/60 bg-primary text-primary-foreground">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Ready to put your school in flow?
                        </h2>
                        <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
                            Sign in with the credentials your administrator
                            provided — or preview a public enquiry form.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link href="/auth/login" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="min-h-[48px] w-full px-6 sm:w-auto"
                                >
                                    Sign in
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link
                                href="/enquire/stmarys"
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="min-h-[48px] w-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                                >
                                    View demo enquiry
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────── */}
            <footer className="border-t border-border/60 py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/logo-square.svg"
                            alt="Onflows"
                            width={20}
                            height={20}
                        />
                        <span>© {new Date().getFullYear()} Onflows</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link
                            href="/auth/login"
                            className="transition-colors hover:text-foreground"
                        >
                            Sign in
                        </Link>
                        <a
                            href="mailto:hello@onflows.app"
                            className="transition-colors hover:text-foreground"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
