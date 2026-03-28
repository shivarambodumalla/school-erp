'use client'

import {
  FileText,
  ClipboardList,
  HelpCircle,
  BarChart3,
  BookOpen,
  Megaphone,
} from 'lucide-react'
import type { SubjectPostType } from '@prisma/client'

const TYPE_OPTIONS: {
  type: SubjectPostType
  label: string
  icon: typeof FileText
  color: string
}[] = [
  {
    type: 'MATERIAL',
    label: 'Material',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    type: 'ASSIGNMENT',
    label: 'Assignment',
    icon: ClipboardList,
    color: 'text-violet-600 bg-violet-50',
  },
  {
    type: 'QUIZ',
    label: 'Quiz',
    icon: HelpCircle,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    type: 'POLL',
    label: 'Poll',
    icon: BarChart3,
    color: 'text-teal-600 bg-teal-50',
  },
  {
    type: 'HOMEWORK',
    label: 'Homework',
    icon: BookOpen,
    color: 'text-orange-600 bg-orange-50',
  },
  {
    type: 'ANNOUNCEMENT',
    label: 'Announcement',
    icon: Megaphone,
    color: 'text-green-600 bg-green-50',
  },
]

interface Props {
  onSelect: (t: SubjectPostType) => void
}

export function TypeSelector({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-4">
      {TYPE_OPTIONS.map((opt) => {
        const Icon = opt.icon
        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelect(opt.type)}
            className="flex flex-col items-center gap-2
              p-4 rounded-xl border transition-colors
              hover:border-primary min-h-[80px]"
          >
            <div
              className={`h-10 w-10 rounded-lg flex
                items-center justify-center ${opt.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
