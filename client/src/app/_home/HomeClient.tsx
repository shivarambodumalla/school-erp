'use client'

import { createContext, useContext, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GetStartedDialog } from './GetStartedDialog'
import {
  Users,
  GraduationCap,
  CreditCard,
  ClipboardList,
  BarChart3,
  Trophy,
  Megaphone,
  Calendar,
  BookOpen,
  Sparkles,
  Check,
  Zap,
  Smartphone,
  Star,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
  Bell,
  Lock,
  Globe,
  UserCheck,
  Target,
  PieChart,
  Bus,
  Heart,
  Rocket,
  Wand2,
  School,
  Briefcase,
  Library,
  Building2,
} from 'lucide-react'

const easeOut = [0.22, 1, 0.36, 1] as const
const easeSmooth = [0.4, 0, 0.2, 1] as const

// ════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════

const GetStartedCtx = createContext<() => void>(() => {})
function useGetStarted(): () => void {
  return useContext(GetStartedCtx)
}

export default function HomeClient(): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false)
  const openDialog = (): void => setDialogOpen(true)

  return (
    <GetStartedCtx.Provider value={openDialog}>
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <Nav />
        <Hero />
        <LogoStrip />
        <FeatureBento />
        <HowItWorks />
        <DetailedFeatureAdmissions />
        <DetailedFeatureGrades />
        <DetailedFeatureFees />
        <DetailedFeatureCommunications />
        <RoleTabs />
        <IntegrationsGrid />
        <WhyOnflows />
        <Testimonials />
        <FAQ />
        <StatsBand />
        <FinalCTA />
        <Footer />
      </div>
      <GetStartedDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </GetStartedCtx.Provider>
  )
}

// ════════════════════════════════════════════════════════════════
// Nav
// ════════════════════════════════════════════════════════════════

function Nav(): JSX.Element {
  const openDialog = useGetStarted()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Image src="/images/logo-square.svg" alt="Onflows" width={32} height={32} priority />
          </motion.div>
          <span className="text-lg font-semibold tracking-tight">Onflows</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#how" className="nav-link">
            How it works
          </a>
          <a href="#roles" className="nav-link">
            For your role
          </a>
          <a href="#pricing" className="nav-link">
            Pricing
          </a>
          <a href="#faq" className="nav-link">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="min-h-[40px] px-3 text-sm sm:px-4">
              Sign in
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={openDialog}
            className="min-h-[40px] rounded-xl px-4 text-sm font-semibold shadow-md shadow-secondary/20 transition-all hover:shadow-lg hover:shadow-secondary/40"
          >
            Get started
          </Button>
        </div>
      </div>
      <style jsx>{`
        :global(.nav-link) {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          transition: color 0.15s;
          position: relative;
        }
        :global(.nav-link:hover) {
          color: hsl(var(--foreground));
        }
        :global(.nav-link::after) {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 2px;
          background: hsl(var(--primary));
          transition: width 0.2s;
        }
        :global(.nav-link:hover::after) {
          width: 100%;
        }
      `}</style>
    </header>
  )
}

// ════════════════════════════════════════════════════════════════
// Hero
// ════════════════════════════════════════════════════════════════

function Hero(): JSX.Element {
  const openDialog = useGetStarted()
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
        />
        <motion.div
          className="absolute top-40 left-0 h-[300px] w-[300px] rounded-full bg-chart-1/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
        />
      </div>

      {/* Decorative doodles */}
      <DoodleStar
        className="absolute top-24 left-[15%] h-8 w-8 text-secondary hidden sm:block"
        delay={0}
      />
      <DoodleStar
        className="absolute top-48 right-[12%] h-6 w-6 text-secondary hidden sm:block"
        delay={0.5}
      />
      <DoodleScribble className="absolute top-12 right-[20%] h-10 w-16 text-secondary hidden md:block" />

      {/* Floating stickers */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-12, -10, -12] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        className="pointer-events-none absolute top-32 left-[8%] hidden lg:block"
      >
        <Sticker color="bg-secondary">
          <Trophy className="mb-1 h-5 w-5 text-secondary-foreground" />
          <span className="text-xs font-bold text-secondary-foreground">+50 points!</span>
        </Sticker>
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [6, 8, 6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }}
        className="pointer-events-none absolute top-40 right-[6%] hidden lg:block"
      >
        <Sticker color="bg-chart-1">
          <Megaphone className="mb-1 h-5 w-5 text-foreground" />
          <span className="text-xs font-bold">New circular</span>
        </Sticker>
      </motion.div>
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-3, -1, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
        className="pointer-events-none absolute bottom-40 left-[4%] hidden lg:block"
      >
        <Sticker color="bg-primary">
          <Target className="mb-1 h-5 w-5 text-primary-foreground" />
          <span className="text-xs font-bold text-primary-foreground">Lead converted ✓</span>
        </Sticker>
      </motion.div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur"
          >
            <motion.span
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
            >
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
            </motion.span>
            <span>Built for modern Indian schools</span>
            <span className="inline-flex h-5 items-center rounded-full bg-secondary/15 px-2 text-[10px] font-semibold text-secondary">
              NEW
            </span>
          </motion.div>
        </div>

        <h1 className="text-balance text-center text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          Your school.
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">In flow.</span>
            <svg
              className="absolute -bottom-2 left-0 h-3 w-full text-primary/40"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M1 6C50 2 100 10 150 6C200 2 250 10 299 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.8, ease: easeOut }}
              />
            </svg>
          </span>
        </h1>

        <p className="text-balance mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-foreground/75 sm:text-lg md:text-xl">
          The all-in-one School ERP + LMS + Community platform. Admissions, attendance, fees,
          grades, communications — run everything in one place, so your team can focus on teaching.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              variant="secondary"
              onClick={openDialog}
              className="relative min-h-[52px] w-full overflow-hidden rounded-xl px-8 text-base font-semibold shadow-lg shadow-secondary/30 transition-shadow hover:shadow-xl hover:shadow-secondary/50 sm:w-auto"
            >
              Get started
            </Button>
          </motion.div>
          <Link href="/enquire/stmarys" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="min-h-[52px] w-full rounded-xl border-2 px-8 text-base font-semibold sm:w-auto"
              >
                See live demo
              </Button>
            </motion.div>
          </Link>
        </div>
        <div className="mt-3 text-center">
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Already a customer? Sign in →
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {['Multi-tenant', 'Mobile-first PWA', 'Role-based access', 'Audit-logged'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-secondary" />
              {item}
            </span>
          ))}
        </div>

        {/* Mock dashboard preview */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-x-4 -inset-y-4 rounded-[2rem] bg-secondary/10 blur-2xl" />
          <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
            <DashboardMockup />
          </motion.div>
          <motion.div
            animate={{ rotate: [6, 8, 6], scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute -top-4 -right-4 hidden rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold shadow-xl sm:block"
          >
            <span className="text-secondary">●</span> Live dashboard
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-4, -2, -4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute -bottom-6 -left-4 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-xl lg:flex lg:items-center lg:gap-2"
          >
            <span className="text-lg">⚡</span>
            <span className="text-xs font-semibold">Real-time updates</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Sticker({ children, color }: { children: React.ReactNode; color: string }): JSX.Element {
  return (
    <div
      className={`${color} flex flex-col items-center rounded-xl p-3 shadow-xl ring-2 ring-background`}
    >
      {children}
    </div>
  )
}

function DoodleStar({ className, delay = 0 }: { className?: string; delay?: number }): JSX.Element {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
      transition={{
        rotate: { duration: 20, repeat: Infinity, ease: 'linear' as const },
        scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay },
      }}
    >
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="currentColor"
        opacity="0.8"
      />
    </motion.svg>
  )
}

function DoodleScribble({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 100 50" fill="none">
      <motion.path
        d="M5 25 Q20 5, 35 25 T65 25 T95 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: easeOut }}
        fill="none"
      />
    </svg>
  )
}

function DashboardMockup(): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <div className="h-3 w-3 rounded-full bg-green-400/70" />
        </div>
        <div className="mx-auto rounded-md bg-background px-4 py-1 text-xs text-muted-foreground">
          yourschool.onflows.app/management/dashboard
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3 p-4 sm:p-6">
        <div className="col-span-2 hidden space-y-2 sm:block">
          <div className="h-7 rounded-md bg-primary/15" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 rounded-md bg-muted" />
          ))}
        </div>
        <div className="col-span-12 space-y-4 sm:col-span-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Students', val: '842', color: 'bg-primary/10 text-primary' },
              { label: 'Staff', val: '53', color: 'bg-secondary/10 text-secondary' },
              { label: 'Leads', val: '50', color: 'bg-chart-1/15 text-foreground' },
              { label: 'Fees due', val: '₹2.4L', color: 'bg-destructive/10 text-destructive' },
            ].map((s) => (
              <motion.div
                key={s.label}
                className={`rounded-lg p-3 ${s.color}`}
                whileHover={{ scale: 1.04, rotate: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="text-[10px] font-medium opacity-80">{s.label}</div>
                <div className="mt-1 text-lg font-bold sm:text-xl">{s.val}</div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2 rounded-lg border border-border bg-background p-3 sm:col-span-2">
              <div className="h-2 w-1/3 rounded bg-muted" />
              <div className="flex items-end gap-2">
                {[40, 65, 55, 80, 72, 90, 60].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-primary"
                    style={{ height: `${h}px` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.08, ease: easeOut }}
                    whileHover={{ scaleY: 1.08, originY: 1 }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <div className="h-2 w-1/2 rounded bg-muted" />
              <div className="space-y-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20" />
                    <div className="h-2 flex-1 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Logo Strip
// ════════════════════════════════════════════════════════════════

function LogoStrip(): JSX.Element {
  const schools = [
    "St. Mary's Convent",
    'DPS Delhi',
    'Modern Valley',
    'Bharat Vidya',
    'Sunrise International',
    'Oakridge Public',
    'Greenwood High',
    'Delhi World',
  ]
  return (
    <section className="relative border-y border-border bg-muted/30 py-10 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Powering schools across India
      </p>
      <div className="mt-6 flex overflow-hidden">
        <motion.div
          animate={{ x: [0, -50 + '%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' as const }}
          className="flex shrink-0 gap-12 pr-12"
        >
          {[...schools, ...schools].map((name, i) => (
            <div
              key={i}
              className="shrink-0 text-lg font-semibold tracking-tight text-muted-foreground/60"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Feature Bento Grid
// ════════════════════════════════════════════════════════════════

function FeatureBento(): JSX.Element {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <DoodleStar
        className="absolute top-20 right-[8%] h-6 w-6 text-primary/40 hidden md:block"
        delay={0.3}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Zap, text: 'Every module. One platform.', color: 'secondary' }}
          title="Everything a school runs on"
          subtitle="Nine tightly-integrated modules. Zero spreadsheets. Zero context-switching."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <BentoCard span="lg:col-span-3 lg:row-span-2" featured>
            <div className="relative">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              >
                <ClipboardList className="h-5 w-5" />
              </motion.div>
              <h3 className="text-2xl font-bold tracking-tight">Admissions & Leads CRM</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground/75">
                Public enquiry forms that embed into any school website. Full lead pipeline with
                kanban + table views. Follow-ups with WhatsApp templates, merit list generator, and
                source-by-source conversion analytics.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Public forms', 'Lead pipeline', 'Follow-ups', 'Merit list', 'Analytics'].map(
                  (tag) => (
                    <motion.span
                      key={tag}
                      whileHover={{ scale: 1.08 }}
                      className="cursor-default rounded-full bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-primary/10 hover:text-primary hover:ring-primary/30"
                    >
                      {tag}
                    </motion.span>
                  ),
                )}
              </div>
            </div>
          </BentoCard>

          <BentoCard span="lg:col-span-3">
            <FeatureIcon
              icon={GraduationCap}
              accent="bg-secondary text-secondary-foreground shadow-secondary/30"
            />
            <h3 className="text-lg font-bold tracking-tight">Grades & Report Cards</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              Exam types, gradebooks, attendance-aware report card PDFs. Auto-distribute to parents
              via WhatsApp.
            </p>
          </BentoCard>

          <BentoCard span="lg:col-span-2">
            <FeatureIcon icon={CreditCard} accent="bg-chart-1 text-foreground shadow-chart-1/30" />
            <h3 className="text-lg font-bold tracking-tight">Fees & Finance</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              Categories, payments, concessions, fines, auto-reminders.
            </p>
          </BentoCard>

          <BentoCard span="lg:col-span-2">
            <FeatureIcon
              icon={BookOpen}
              accent="bg-primary text-primary-foreground shadow-primary/30"
            />
            <h3 className="text-lg font-bold tracking-tight">Courses & LMS</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              Modules, quizzes, rubrics, discussions, live classes.
            </p>
          </BentoCard>

          <BentoCard span="lg:col-span-2">
            <FeatureIcon
              icon={Megaphone}
              accent="bg-destructive text-destructive-foreground shadow-destructive/30"
            />
            <h3 className="text-lg font-bold tracking-tight">Circulars</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              Targeted broadcasts with read tracking.
            </p>
          </BentoCard>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <CompactFeature icon={Users} title="Students & Staff" />
          <CompactFeature icon={Trophy} title="Kudos & Badges" />
          <CompactFeature icon={Calendar} title="Timetable" />
          <CompactFeature icon={BarChart3} title="Reports" />
        </div>
      </div>
    </section>
  )
}

function BentoCard({
  children,
  span,
  featured,
}: {
  children: React.ReactNode
  span: string
  featured?: boolean
}): JSX.Element {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`group relative overflow-hidden rounded-2xl border border-border p-6 transition-shadow hover:border-primary/30 hover:shadow-xl lg:p-6 ${span} ${
        featured ? 'bg-primary/5 lg:p-8' : 'bg-card'
      }`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
      {children}
    </motion.div>
  )
}

function FeatureIcon({ icon: Icon, accent }: { icon: typeof Users; accent: string }): JSX.Element {
  return (
    <motion.div
      whileHover={{ rotate: 5, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${accent}`}
    >
      <Icon className="h-5 w-5" />
    </motion.div>
  )
}

function CompactFeature({ icon: Icon, title }: { icon: typeof Users; title: string }): JSX.Element {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <motion.div
        whileHover={{ rotate: 6 }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
      >
        <Icon className="h-4 w-4" />
      </motion.div>
      <span className="text-sm font-semibold">{title}</span>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════
// How It Works (improved, playful)
// ════════════════════════════════════════════════════════════════

function HowItWorks(): JSX.Element {
  const steps = [
    {
      num: '01',
      icon: School,
      bgIcon: Building2,
      title: 'Set up your school',
      body: 'Pick your subdomain, upload logo + theme, define class structure. Takes under an hour.',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      num: '02',
      icon: Users,
      bgIcon: Users,
      title: 'Onboard your people',
      body: 'Bulk import students, staff, and guardians from CSV. Role-based access assigned automatically.',
      gradient: 'from-secondary/20 to-secondary/5',
    },
    {
      num: '03',
      icon: Rocket,
      bgIcon: Rocket,
      title: 'Run everything',
      body: 'Attendance, grades, fees, communications, admissions — your staff works from one familiar interface.',
      gradient: 'from-chart-1/30 to-chart-1/5',
    },
  ]

  return (
    <section id="how" className="relative bg-muted/30 py-20 sm:py-28 overflow-hidden">
      {/* decorative background doodles */}
      <DoodleStar
        className="absolute top-20 left-[8%] h-10 w-10 text-chart-1 hidden md:block"
        delay={0.2}
      />
      <DoodleStar
        className="absolute bottom-20 right-[10%] h-8 w-8 text-primary/60 hidden md:block"
        delay={1}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Wand2, text: 'Simple setup', color: 'secondary' }}
          title="From signup to first class in under a week"
          subtitle="No migration nightmares. No year-long rollouts. Most schools are live by end of week."
        />

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* dashed connector on desktop */}
          <svg
            className="pointer-events-none absolute top-16 left-0 right-0 hidden h-10 w-full md:block"
            viewBox="0 0 1000 40"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M170 20 Q 335 -10, 500 20 T 830 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 8"
              className="text-primary/30"
            />
          </svg>

          {steps.map((step) => {
            const Icon = step.icon
            const BgIcon = step.bgIcon
            return (
              <motion.div
                key={step.num}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-xl sm:p-8`}
              >
                {/* large faded bg icon */}
                <BgIcon
                  className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-foreground/5 transition-colors group-hover:text-primary/15"
                  strokeWidth={1.25}
                />

                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-4xl font-bold text-muted-foreground/30">{step.num}</span>
                    <motion.div
                      whileHover={{ rotate: 6 }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary shadow-md ring-1 ring-border"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Detailed Feature Sections
// ════════════════════════════════════════════════════════════════

function DetailedFeatureAdmissions(): JSX.Element {
  return (
    <FeatureCardSection
      tagIcon={ClipboardList}
      tagLabel="CRM"
      tagColor="text-primary bg-primary/10 ring-primary/20"
      panelBg="from-primary/5 to-primary/0"
      cardIcon={ClipboardList}
      cardIconBg="bg-primary"
      title="Turn every enquiry into an admission"
      body="From first WhatsApp message to enrolment — track, nurture, and convert every prospective family in one pipeline."
      bullets={[
        'Embeddable public enquiry form with your school branding',
        'Kanban pipeline: NEW → CONTACTED → APPLIED → CONVERTED',
        'Follow-up scheduler with auto-suggestions',
        'WhatsApp templates for teachers, one-click send',
        'Merit list generator with configurable ranking',
      ]}
      cta="See the CRM"
      ctaHref="/enquire/stmarys"
      illustration={<LeadFlowIllustration />}
      reverse={false}
      ringColor="ring-primary/25"
    />
  )
}

function DetailedFeatureGrades(): JSX.Element {
  return (
    <FeatureCardSection
      tagIcon={GraduationCap}
      tagLabel="GRADES"
      tagColor="text-secondary bg-secondary/10 ring-secondary/20"
      panelBg="from-secondary/5 to-secondary/0"
      cardIcon={GraduationCap}
      cardIconBg="bg-secondary"
      title="Exam entry to parent's WhatsApp in minutes"
      body="One workflow from gradebook to printed report card. Teachers enter marks. The system does the rest."
      bullets={[
        'Per-subject gradebook with bulk entry',
        'Multiple exam types with configurable weights',
        'Attendance percentage auto-included',
        'Print-styled PDF with school header + signatures',
        'Bulk distribute to parents via WhatsApp',
      ]}
      cta="See report card preview"
      ctaHref="/auth/login"
      illustration={<GradesNetworkIllustration />}
      reverse={true}
      ringColor="ring-secondary/25"
    />
  )
}

function DetailedFeatureFees(): JSX.Element {
  return (
    <FeatureCardSection
      tagIcon={CreditCard}
      tagLabel="FEES"
      tagColor="text-foreground bg-chart-1/20 ring-chart-1/40"
      panelBg="from-chart-1/10 to-chart-1/0"
      cardIcon={CreditCard}
      cardIconBg="bg-chart-1"
      title="Collection that runs itself"
      body="Automated reminders, configurable concessions, and a parent-friendly payment flow that actually gets fees paid on time."
      bullets={[
        'Fee categories by class, with optional fees toggle',
        'Sibling, staff, merit, and financial-aid concessions',
        'Auto-applied fines based on days-overdue rules',
        'WhatsApp + email reminders sent automatically',
        'Receipt generation with configurable numbering',
      ]}
      cta="Explore fees"
      ctaHref="/auth/login"
      illustration={<FeesFlowIllustration />}
      reverse={false}
      ringColor="ring-chart-1/40"
    />
  )
}

function DetailedFeatureCommunications(): JSX.Element {
  return (
    <FeatureCardSection
      tagIcon={Megaphone}
      tagLabel="CIRCULARS"
      tagColor="text-destructive bg-destructive/10 ring-destructive/20"
      panelBg="from-destructive/5 to-destructive/0"
      cardIcon={Megaphone}
      cardIconBg="bg-destructive"
      title="Replace the WhatsApp group chaos"
      body="Official circulars that reach the right people with read-receipts, so you know exactly who saw what."
      bullets={[
        'Target by audience: all, parents, students, staff, class',
        'Pin urgent circulars at top of every feed',
        'Track read status: see who opened, who did not',
        'Attach files, images, event links',
        'Push notifications reach parents instantly',
      ]}
      cta="See circulars"
      ctaHref="/auth/login"
      illustration={<CircularBroadcastIllustration />}
      reverse={true}
      ringColor="ring-destructive/25"
    />
  )
}

// ── Memberstack-style section wrapper ────────────────────────

function FeatureCardSection({
  tagIcon: TagIcon,
  tagLabel,
  tagColor,
  panelBg,
  cardIcon: CardIcon,
  cardIconBg,
  title,
  body,
  bullets,
  cta,
  ctaHref,
  illustration,
  reverse,
  ringColor,
}: {
  tagIcon: typeof Users
  tagLabel: string
  tagColor: string
  panelBg: string
  cardIcon: typeof Users
  cardIconBg: string
  title: string
  body: string
  bullets: string[]
  cta: string
  ctaHref: string
  illustration: React.ReactNode
  reverse: boolean
  ringColor: string
}): JSX.Element {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* small tag pill above the card */}
        <div className="mb-4 flex">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ${tagColor}`}
          >
            <TagIcon className="h-3 w-3" />
            {tagLabel}
          </motion.div>
        </div>

        {/* bordered card, 2 halves */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`relative overflow-hidden rounded-[2rem] border-2 ${panelBg} shadow-sm transition-shadow hover:shadow-xl ${ringColor}`}
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div
            className={`grid grid-cols-1 items-center gap-0 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-last' : ''}`}
          >
            {/* Illustration panel */}
            <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden p-8 sm:p-10 lg:min-h-[440px]">
              {illustration}
            </div>

            {/* Text panel */}
            <div className="relative p-8 sm:p-12 lg:p-14">
              <motion.div
                whileHover={{ rotate: 6, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${cardIconBg} text-primary-foreground shadow-md`}
              >
                <CardIcon className="h-6 w-6" />
              </motion.div>
              <h3 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/75 sm:text-base">{body}</p>
              <ul className="mt-6 space-y-2.5">
                {bullets.map((b) => (
                  <motion.li
                    key={b}
                    whileHover={{ x: 3 }}
                    className="flex items-start gap-2.5 cursor-default"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{b}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={ctaHref}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <Button className="min-h-[44px] rounded-xl px-5 text-sm font-semibold">
                      {cta}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Memberstack-style illustrations ──────────────────────────

// 1. LEAD FLOW — horizontal pipeline: source chips → 4 stages → conversion stat
function LeadFlowIllustration(): JSX.Element {
  const stages = [
    { label: 'NEW', count: '8', color: 'bg-card text-foreground ring-border' },
    { label: 'CONTACTED', count: '10', color: 'bg-card text-foreground ring-border' },
    { label: 'APPLIED', count: '8', color: 'bg-primary/10 text-primary ring-primary/30' },
    { label: 'CONVERTED', count: '8', color: 'bg-secondary/15 text-secondary ring-secondary/30' },
  ]
  const sources: Array<{ icon: typeof Users; label: string }> = [
    { icon: Globe, label: 'Website' },
    { icon: MessageCircle, label: 'WhatsApp' },
    { icon: Users, label: 'Walk-in' },
  ]
  return (
    <div className="w-full max-w-md space-y-5">
      {/* source chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {sources.map(({ icon: SIcon, label }) => (
          <motion.span
            key={label}
            whileHover={{ y: -2 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border shadow-sm"
          >
            <SIcon className="h-3 w-3 text-secondary" />
            {label}
          </motion.span>
        ))}
      </div>

      {/* down connector */}
      <FlowArrow direction="down" color="secondary" />

      {/* 4 stages — 2×2 grid, chevrons between */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
        <StageCard {...stages[0]!} />
        <FlowChevron />
        <StageCard {...stages[1]!} />
        <div className="col-span-3 flex justify-center py-1">
          <FlowArrow direction="down" color="primary" />
        </div>
        <StageCard {...stages[3]!} />
        <FlowChevron reversed />
        <StageCard {...stages[2]!} />
      </div>

      {/* conversion stat */}
      <motion.div
        whileHover={{ y: -2 }}
        className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-border shadow-sm"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-secondary" />
          <span className="text-xs font-semibold">Conversion rate</span>
        </div>
        <span className="text-sm font-bold text-secondary">24%</span>
      </motion.div>
    </div>
  )
}

function StageCard({
  label,
  count,
  color,
}: {
  label: string
  count: string
  color: string
}): JSX.Element {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`flex flex-col items-center justify-center rounded-2xl px-4 py-4 text-center ring-1 shadow-sm ${color}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-0.5 text-2xl font-bold">{count}</div>
    </motion.div>
  )
}

function FlowChevron({ reversed }: { reversed?: boolean }): JSX.Element {
  return (
    <div className="flex items-center justify-center">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={reversed ? 'rotate-180' : ''}
      >
        <motion.path
          d="M 5 4 L 13 10 L 5 16"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: easeOut }}
        />
      </svg>
    </div>
  )
}

function FlowArrow({
  direction,
  color,
}: {
  direction: 'down' | 'right'
  color: 'primary' | 'secondary' | 'chart-1'
}): JSX.Element {
  const stroke =
    color === 'primary'
      ? 'hsl(var(--primary))'
      : color === 'secondary'
        ? 'hsl(var(--secondary))'
        : 'hsl(var(--chart-1))'
  return (
    <div className={`flex ${direction === 'down' ? 'justify-center' : 'items-center'}`}>
      <svg
        width={direction === 'down' ? 20 : 28}
        height={direction === 'down' ? 28 : 20}
        viewBox={direction === 'down' ? '0 0 20 28' : '0 0 28 20'}
        fill="none"
      >
        {direction === 'down' ? (
          <motion.path
            d="M 10 2 L 10 22 M 5 17 L 10 23 L 15 17"
            stroke={stroke}
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: easeOut }}
          />
        ) : (
          <motion.path
            d="M 2 10 L 22 10 M 17 5 L 23 10 L 17 15"
            stroke={stroke}
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: easeOut }}
          />
        )}
      </svg>
    </div>
  )
}

// 2. GRADES NETWORK — student hub with subjects, using grid layout (no absolute positioning)
function GradesNetworkIllustration(): JSX.Element {
  const subjects = [
    { label: 'Math', grade: 'A+', color: 'text-primary bg-primary/10 ring-primary/30' },
    { label: 'Science', grade: 'A', color: 'text-secondary bg-secondary/10 ring-secondary/30' },
    { label: 'English', grade: 'B+', color: 'text-foreground bg-chart-1/20 ring-chart-1/40' },
    { label: 'Hindi', grade: 'A', color: 'text-foreground bg-muted ring-border' },
  ]
  return (
    <div className="w-full max-w-md space-y-4">
      {/* center student card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="mx-auto w-fit rounded-2xl bg-card px-4 py-3 shadow-md ring-1 ring-border"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary">
            PP
          </div>
          <div>
            <div className="text-sm font-semibold">Priya Patel</div>
            <div className="text-[10px] text-muted-foreground">Class 8A · Roll #12</div>
          </div>
        </div>
      </motion.div>

      {/* down connector */}
      <FlowArrow direction="down" color="secondary" />

      {/* subjects 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`flex items-center justify-between rounded-xl px-3 py-3 ring-1 shadow-sm ${s.color}`}
          >
            <span className="text-sm font-semibold">{s.label}</span>
            <span className="rounded-md bg-background/70 px-2 py-0.5 text-xs font-bold">
              {s.grade}
            </span>
          </motion.div>
        ))}
      </div>

      {/* down connector */}
      <FlowArrow direction="down" color="primary" />

      {/* report card summary */}
      <motion.div
        whileHover={{ y: -2 }}
        className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-border shadow-sm"
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Half-Yearly Report · 89%</span>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          Rank #2
        </span>
      </motion.div>
    </div>
  )
}

// 3. FEES FLOW — Invoice → payment gateway → receipt with animated progress
function FeesFlowIllustration(): JSX.Element {
  return (
    <div className="relative w-full max-w-md space-y-4">
      {/* Fee summary card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-2xl bg-card p-4 ring-1 ring-border shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Term 1 · 2026
          </span>
          <span className="rounded-full bg-chart-1/20 px-2 py-0.5 text-[10px] font-bold text-foreground">
            DUE
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-xl font-bold">₹42,500</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '74%' }}
            transition={{ duration: 1.2, delay: 0.3, ease: easeOut }}
            className="h-full rounded-full bg-secondary"
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>₹31,450 collected</span>
          <span>74%</span>
        </div>
      </motion.div>

      {/* Down arrow */}
      <div className="flex justify-center">
        <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
          <motion.path
            d="M 16 2 L 16 18 M 10 14 L 16 20 L 22 14"
            stroke="hsl(var(--chart-1))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: easeOut }}
          />
        </svg>
      </div>

      {/* Payment methods row */}
      <div className="flex items-center justify-center gap-2">
        {[
          { label: 'UPI', color: 'bg-primary/10 text-primary ring-primary/20' },
          { label: 'Card', color: 'bg-secondary/15 text-secondary ring-secondary/30' },
          { label: 'Bank', color: 'bg-chart-1/20 text-foreground ring-chart-1/40' },
        ].map((m) => (
          <motion.div
            key={m.label}
            whileHover={{ y: -2, scale: 1.05 }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${m.color}`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            {m.label}
          </motion.div>
        ))}
      </div>

      {/* Down arrow */}
      <div className="flex justify-center">
        <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
          <motion.path
            d="M 16 2 L 16 18 M 10 14 L 16 20 L 22 14"
            stroke="hsl(var(--secondary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.5, ease: easeOut }}
          />
        </svg>
      </div>

      {/* Receipt card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-2xl bg-secondary/5 p-4 ring-1 ring-secondary/30 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-secondary">Payment received</div>
              <div className="text-[10px] text-muted-foreground">Receipt RCP-2026-0471</div>
            </div>
          </div>
          <span className="text-sm font-bold text-secondary">₹11,050</span>
        </div>
      </motion.div>
    </div>
  )
}

// 4. CIRCULAR BROADCAST — central circular, then branches down to audience chips
function CircularBroadcastIllustration(): JSX.Element {
  const audiences: Array<{ label: string; count: string; Icon: typeof Users }> = [
    { label: 'All Parents', count: '884', Icon: Heart },
    { label: 'Students', count: '842', Icon: GraduationCap },
    { label: 'Staff', count: '53', Icon: Briefcase },
    { label: 'Class 8', count: '72', Icon: Users },
  ]
  return (
    <div className="w-full max-w-md space-y-4">
      {/* Central circular card */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="rounded-2xl border-l-4 border-destructive bg-card p-4 shadow-md ring-1 ring-border"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <Bell className="h-3.5 w-3.5 text-destructive" />
          </motion.span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
            Urgent · Pinned
          </span>
        </div>
        <div className="mt-2 text-sm font-semibold">Annual Day — venue changed</div>
        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
          Due to forecast rain, the Annual Day on 18 April will now be held in the school auditorium
          instead of the open grounds.
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>2h ago</span>
          <span>Read 832 / 1,851</span>
        </div>
      </motion.div>

      {/* branching fan — a single SVG sized to the grid width */}
      <svg
        width="100%"
        height="40"
        viewBox="0 0 400 40"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {[50, 150, 250, 350].map((x, i) => (
          <motion.path
            key={i}
            d={`M 200 0 Q 200 20, ${x} 38`}
            stroke="hsl(var(--destructive))"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeDasharray="3 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: easeOut }}
          />
        ))}
      </svg>

      {/* audience chips row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {audiences.map((a) => {
          const AIcon = a.Icon
          return (
            <motion.div
              key={a.label}
              whileHover={{ y: -3, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex flex-col items-center justify-center rounded-xl bg-card px-3 py-3 ring-1 ring-border shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AIcon className="h-4 w-4" />
              </div>
              <span className="mt-1.5 text-[11px] font-semibold leading-tight text-center">
                {a.label}
              </span>
              <span className="mt-0.5 text-[10px] font-bold text-muted-foreground">{a.count}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Role Tabs
// ════════════════════════════════════════════════════════════════

function RoleTabs(): JSX.Element {
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent' | 'student'>('admin')
  const roles = {
    admin: {
      icon: Briefcase,
      title: 'School Admin',
      bullets: [
        'Configure institution branding, theme, and academic year',
        'Manage all users and role-based permissions',
        'View cross-module reports and analytics',
        'Handle admissions, fees, payroll, and compliance',
        'Audit log of every mutation across the platform',
      ],
    },
    teacher: {
      icon: GraduationCap,
      title: 'Teacher',
      bullets: [
        'Mark attendance in 30 seconds per section',
        'Enter grades in a spreadsheet-like gradebook',
        'Post homework, assignments, quizzes, and discussions',
        'Give kudos to students with one tap',
        'Access only their assigned subjects and classes',
      ],
    },
    parent: {
      icon: Heart,
      title: 'Parent',
      bullets: [
        'Pay fees from the parent app, one-tap UPI',
        'Receive circulars with push notifications',
        'View grades, attendance, and report cards anytime',
        'Chat with class teacher in-app',
        'See kudos and achievements as they happen',
      ],
    },
    student: {
      icon: UserCheck,
      title: 'Student',
      bullets: [
        'Dashboard with today’s timetable and pending homework',
        'Access subject materials, quizzes, and assignments',
        'Submit work and track grades',
        'View kudos earned and leaderboard',
        'See circulars relevant to their class',
      ],
    },
  }
  const current = roles[role]
  const Icon = current.icon

  return (
    <section
      id="roles"
      className="relative border-y border-border bg-muted/30 py-20 sm:py-28 overflow-hidden"
    >
      <DoodleStar
        className="absolute top-16 right-[10%] h-7 w-7 text-secondary/60 hidden md:block"
        delay={0.4}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Users, text: 'For every role in the school' }}
          title="One platform. Four perfect fits."
          subtitle="Each role gets exactly what they need. Nothing more. Nothing less."
        />

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {(Object.keys(roles) as Array<keyof typeof roles>).map((r) => {
            const RIcon = roles[r].icon
            return (
              <motion.button
                key={r}
                onClick={() => setRole(r)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors ${
                  role === r
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                <RIcon className="h-4 w-4" />
                {roles[r].title}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: easeSmooth }}
            className="mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-2"
          >
            <div>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              <h3 className="text-3xl font-bold tracking-tight">What {current.title}s get</h3>
              <ul className="mt-6 space-y-3">
                {current.bullets.map((b) => (
                  <motion.li
                    key={b}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 cursor-default"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{b}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {current.title} view
                  </span>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-secondary"
                  />
                  LIVE
                </span>
              </div>
              <div className="space-y-3">
                {current.bullets.slice(0, 4).map((b, i) => (
                  <motion.div
                    key={b}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="flex items-start gap-3 rounded-lg bg-muted/30 p-3 cursor-pointer"
                  >
                    <div className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-card text-xs font-bold text-primary ring-1 ring-border">
                      {i + 1}
                    </div>
                    <span className="text-xs leading-relaxed">{b}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Integrations
// ════════════════════════════════════════════════════════════════

function IntegrationsGrid(): JSX.Element {
  const items = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      desc: 'Automated parent messages',
      color: 'text-secondary',
    },
    { name: 'Email', icon: Mail, desc: 'Bulk + transactional', color: 'text-primary' },
    { name: 'SMS', icon: Phone, desc: 'Attendance + fee alerts', color: 'text-chart-1' },
    { name: 'Push Notifs', icon: Bell, desc: 'Real-time app alerts', color: 'text-destructive' },
    { name: 'Bus GPS', icon: Bus, desc: 'Live tracking', color: 'text-primary' },
    { name: 'UPI Payments', icon: CreditCard, desc: 'Fee collection', color: 'text-secondary' },
    { name: 'Cloud Storage', icon: Globe, desc: 'Documents + media', color: 'text-chart-1' },
    { name: 'Analytics', icon: PieChart, desc: 'Usage reports', color: 'text-destructive' },
  ]
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <DoodleStar
        className="absolute bottom-20 left-[8%] h-8 w-8 text-primary/40 hidden md:block"
        delay={0.6}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Zap, text: 'Works with your tools' }}
          title="Integrates with everything you already use"
          subtitle="Parents don't want a new app for every school service. Onflows reaches them where they already are."
        />
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.name}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 text-center transition-shadow hover:border-primary/40 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${item.color} transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <div className="mt-3 text-sm font-semibold">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Why Onflows (improved with gradient icons + playful hover)
// ════════════════════════════════════════════════════════════════

function WhyOnflows(): JSX.Element {
  const items = [
    {
      icon: Smartphone,
      title: 'Mobile-first, not mobile-after',
      body: 'Designed for 320px screens first. Every tap target is 44px+, every toolbar collapses cleanly, every form works with one thumb.',
      solid: 'bg-primary',
      accent: 'bg-primary/5',
    },
    {
      icon: Lock,
      title: 'Multi-tenant by design',
      body: 'Every database query is scoped to your institution. Super admins can masquerade for support, with a read-only lock by default.',
      solid: 'bg-secondary',
      accent: 'bg-secondary/5',
    },
    {
      icon: Zap,
      title: 'Built in the open',
      body: 'No black boxes. TypeScript strict mode, audit logs on every mutation, Prisma schema that reads like documentation.',
      solid: 'bg-chart-1',
      accent: 'bg-chart-1/10',
    },
  ]
  return (
    <section className="relative border-y border-border bg-muted/30 py-20 sm:py-28 overflow-hidden">
      <DoodleScribble className="absolute top-20 left-[10%] h-10 w-16 text-primary/30 hidden md:block" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Sparkles, text: 'Why Onflows' }}
          title="Built different for schools"
          subtitle="Not a generic ERP adapted for education. Every design choice made for a school's reality."
        />
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-xl sm:p-8`}
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${item.accent} blur-2xl`}
                />
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.solid} text-primary-foreground shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <h3 className="relative text-xl font-bold tracking-tight">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Testimonials
// ════════════════════════════════════════════════════════════════

function Testimonials(): JSX.Element {
  const items = [
    {
      quote:
        'We moved from three disconnected tools to one platform. Our admissions team closes leads 40% faster, and parents stopped asking us for fee receipts over WhatsApp.',
      name: 'Priya Sharma',
      role: 'Principal',
      school: "St. Mary's Convent",
      color: 'bg-primary/15 text-primary',
    },
    {
      quote:
        'The parent portal replaced our WhatsApp groups completely. Fee collection jumped to 94% on-time without any reminder calls. The admin team got their evenings back.',
      name: 'Rajesh Kumar',
      role: 'Administrator',
      school: 'Modern Valley School',
      color: 'bg-secondary/20 text-secondary',
    },
    {
      quote:
        'Our teachers actually enjoy using it. Grades, attendance, and circulars in one app — no training needed. The kudos feature has completely changed classroom culture.',
      name: 'Anita Iyer',
      role: 'VP Academics',
      school: 'Sunrise International',
      color: 'bg-chart-1/25 text-foreground',
    },
  ]
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Heart, text: 'Loved by school teams', color: 'secondary' }}
          title="Schools that switched to Onflows"
          subtitle="Real quotes from principals and administrators who made the move."
        />
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t) => (
            <motion.div
              key={t.name}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-xl"
            >
              <span className="absolute -top-3 -left-3 text-6xl text-primary/10 leading-none select-none">
                &ldquo;
              </span>
              <div className="relative flex gap-0.5 text-chart-1">
                {[...Array(5)].map((_, j) => (
                  <motion.span
                    key={j}
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </motion.span>
                ))}
              </div>
              <p className="relative mt-4 flex-1 text-base leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="relative mt-6 flex items-center gap-3 border-t border-border pt-4">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${t.color}`}
                >
                  {t.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </motion.div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} · {t.school}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// FAQ
// ════════════════════════════════════════════════════════════════

function FAQ(): JSX.Element {
  const items = [
    {
      q: 'How long does setup take?',
      a: 'Most schools are live within 2-5 business days. We provide CSV templates for bulk-importing students, staff, and classes. Our onboarding team handles the initial configuration with you on a single call.',
    },
    {
      q: 'Can we migrate from our existing ERP?',
      a: 'Yes. We support migration from most school ERPs via CSV export. Our team has helped schools migrate from Tally-based systems, Google Sheets workflows, and legacy on-premise ERPs.',
    },
    {
      q: 'Is our data secure?',
      a: "Yes. Every tenant is logically isolated at the database query level — your data is never mixed with another school's. All data is encrypted at rest and in transit. We maintain audit logs of every data mutation.",
    },
    {
      q: 'Does it work on low-end Android phones?',
      a: 'Yes. Onflows is a Progressive Web App designed mobile-first. It works on phones as old as Android 8 with 2GB RAM, and on 2G/3G connections with aggressive caching and offline-friendly flows.',
    },
    {
      q: 'What about parents who do not use smartphones?',
      a: 'SMS and WhatsApp templates work without requiring the parent to install an app. Fee reminders, attendance alerts, and circulars reach them via the channels they already use.',
    },
    {
      q: 'Can we white-label the parent portal?',
      a: 'Yes. Every institution gets its own subdomain (yourschool.onflows.app or a custom domain), custom logo, primary/secondary color theme, and branded report cards and receipts.',
    },
    {
      q: 'What does it cost?',
      a: 'We price per-student with transparent tiers based on student count. Starter plans include all core modules. Growth adds advanced analytics and integrations. Enterprise adds dedicated support and SSO. Contact us for exact pricing.',
    },
    {
      q: 'Who owns our data?',
      a: 'You do. Your data remains your property — we simply process it. You can export all your data at any time in standard formats, and we delete it permanently on request within 30 days of account closure.',
    },
  ]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section
      id="faq"
      className="relative border-y border-border bg-muted/30 py-20 sm:py-28 overflow-hidden"
    >
      <DoodleStar
        className="absolute top-16 right-[8%] h-7 w-7 text-chart-1 hidden md:block"
        delay={0.3}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader
          pill={{ icon: Sparkles, text: 'FAQ' }}
          title="Questions, answered"
          subtitle="The things school leaders ask us most often."
        />
        <div className="mt-12 space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.005 }}
              className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
              >
                <span className="text-sm font-semibold sm:text-base">{item.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: easeSmooth }}
                  >
                    <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Stats Band
// ════════════════════════════════════════════════════════════════

function StatsBand(): JSX.Element {
  const stats = [
    { label: 'Modules integrated', value: '20+' },
    { label: 'Avg setup time', value: '< 1 week' },
    { label: 'Tenant isolation', value: '100%' },
    { label: 'Uptime SLA', value: '99.9%' },
  ]
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.04, y: -2 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="cursor-default"
            >
              <div className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Final CTA (bg FIXED, more playful)
// ════════════════════════════════════════════════════════════════

function FinalCTA(): JSX.Element {
  const openDialog = useGetStarted()
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-primary py-24 text-primary-foreground sm:py-32"
    >
      {/* decorative blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
        className="pointer-events-none absolute -top-20 right-10 h-80 w-80 rounded-full bg-secondary/40 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
        className="pointer-events-none absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-chart-1/40 blur-3xl"
      />

      {/* decorative floating icons */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
        className="pointer-events-none absolute top-16 left-[10%] hidden text-primary-foreground/25 lg:block"
      >
        <GraduationCap className="h-12 w-12" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
        className="pointer-events-none absolute top-20 right-[12%] hidden text-primary-foreground/25 lg:block"
      >
        <Sparkles className="h-12 w-12" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
        className="pointer-events-none absolute bottom-24 left-[18%] hidden text-primary-foreground/25 lg:block"
      >
        <Target className="h-10 w-10" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }}
        className="pointer-events-none absolute bottom-28 right-[16%] hidden text-primary-foreground/25 lg:block"
      >
        <Library className="h-10 w-10" strokeWidth={1.5} />
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Put your school
          <br />
          <span className="relative inline-block">
            in flow today.
            <svg
              className="absolute -bottom-2 left-0 h-3 w-full text-primary-foreground/60"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M1 6C50 2 100 10 150 6C200 2 250 10 299 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: easeOut }}
              />
            </svg>
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/85">
          Sign in with the credentials your administrator provided, or preview a live enquiry form
          to see how it works.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              variant="secondary"
              onClick={openDialog}
              className="min-h-[52px] w-full rounded-xl px-8 text-base font-semibold shadow-xl sm:w-auto"
            >
              Get started
            </Button>
          </motion.div>
          <Link href="/enquire/stmarys" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="min-h-[52px] w-full rounded-xl border-2 border-primary-foreground/40 bg-transparent px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              >
                View demo
              </Button>
            </motion.div>
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            No credit card to preview
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Setup under a week
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Cancel anytime
          </span>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// Footer
// ════════════════════════════════════════════════════════════════

function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border bg-muted/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ rotate: 6, scale: 1.05 }}>
                <Image src="/images/logo-square.svg" alt="Onflows" width={28} height={28} />
              </motion.div>
              <span className="text-base font-semibold">Onflows</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Your school. In flow. The all-in-one ERP + LMS + Community for modern schools.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how' },
              { label: 'For your role', href: '#roles' },
              { label: 'Pricing', href: '#pricing' },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { label: 'FAQ', href: '#faq' },
              { label: 'Demo', href: '/enquire/stmarys' },
              { label: 'Contact', href: 'mailto:hello@onflows.app' },
            ]}
          />
          <FooterAccountCol />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Onflows. Built for modern Indian schools.
          </span>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="mailto:hello@onflows.app" className="transition-colors hover:text-foreground">
              hello@onflows.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}): JSX.Element {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-foreground/80 transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterAccountCol(): JSX.Element {
  const openDialog = useGetStarted()
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Account
      </div>
      <ul className="mt-4 space-y-2">
        <li>
          <Link
            href="/auth/login"
            className="text-sm text-foreground/80 transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
          >
            Sign in
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={openDialog}
            className="text-sm text-foreground/80 transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
          >
            Get started
          </button>
        </li>
      </ul>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Shared Section Header
// ════════════════════════════════════════════════════════════════

function SectionHeader({
  pill,
  title,
  subtitle,
}: {
  pill: { icon: typeof Users; text: string; color?: 'primary' | 'secondary' }
  title: string
  subtitle: string
}): JSX.Element {
  const Icon = pill.icon
  const isSec = pill.color === 'secondary'
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`mb-4 inline-flex cursor-default items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          isSec ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}
      >
        <Icon className="h-3 w-3" />
        {pill.text}
      </motion.div>
      <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg text-foreground/75">{subtitle}</p>
    </div>
  )
}
