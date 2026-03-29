import Link from 'next/link'
import { SlidersHorizontal, Users, BookOpenCheck, Palette } from 'lucide-react'

const SETTINGS_LINKS = [
  { label: 'Admission Settings', path: 'admissions', icon: SlidersHorizontal, desc: 'Number formats, ID proof types, document types' },
  { label: 'Staff Settings', path: 'staff', icon: Users, desc: 'Employee numbers, departments, leave types, salary' },
  { label: 'Academic Settings', path: 'academics', icon: BookOpenCheck, desc: 'Exam types, attendance mode, grading' },
  { label: 'White Label', path: 'whitelabel', icon: Palette, desc: 'Branding, colors, logos' },
]

export default function SuperManageSettings({
  params,
}: {
  params: { institutionId: string }
}) {
  const base = `/super/institutions/${params.institutionId}/manage/settings`

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_LINKS.map((item) => (
          <Link
            key={item.path}
            href={`${base}/${item.path}`}
            className="flex items-start gap-4 p-5 rounded-xl border
              bg-card hover:bg-accent/50 transition-colors"
          >
            <item.icon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
