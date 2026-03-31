'use client'

import { useRouter } from 'next/navigation'
import { HelpCircle, Play, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
  subjectId: string
}

export function QuizViewer({ item, subjectId }: Props) {
  const router = useRouter()

  const handleStart = () => {
    // Navigate to the quiz taking interface
    // This would be built by the quiz feature but we route to it
    router.push(
      `/management/subjects/${subjectId}/items/${item.id}/quiz`
    )
  }

  return (
    <div
      className="rounded-xl border bg-card p-6
        flex flex-col items-center gap-5 text-center"
    >
      <div
        className="h-16 w-16 rounded-full bg-amber-50
          flex items-center justify-center"
      >
        <HelpCircle className="h-8 w-8 text-amber-600" />
      </div>

      <div>
        <h2 className="text-lg font-semibold">{item.title}</h2>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {item.description}
          </p>
        )}
      </div>

      {/* Quiz meta */}
      <div className="flex flex-wrap gap-3 justify-center">
        {item.totalMarks !== null && (
          <div className="flex items-center gap-1.5 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{item.totalMarks} marks</span>
          </div>
        )}
        {item.estimatedMinutes && (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{item.estimatedMinutes} min</span>
          </div>
        )}
        {item.maxAttempts !== null && (
          <Badge variant="outline" className="text-xs">
            {item.maxAttempts} attempt(s)
          </Badge>
        )}
      </div>

      <Button
        onClick={handleStart}
        className="min-h-[44px] gap-2"
      >
        <Play className="h-4 w-4" />
        Start Quiz
      </Button>
    </div>
  )
}
