'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuizTimer } from './QuizTimer'

type Phase = 'INTRO' | 'TAKING' | 'SUBMITTED' | 'RESULTS'

interface QuizQuestion {
  id: string
  type: string
  text: string
  options: string[]
  marks: number
  order: number
}

interface Props {
  subjectId: string
  quizId: string
}

export function QuizTakingClient({ subjectId, quizId }: Props) {
  const [phase, setPhase] = useState<Phase>('INTRO')
  const [attemptId, setAttemptId] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [totalMarks, setTotalMarks] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    const res = await fetch(
      `/api/student/subjects/${subjectId}/quizzes/${quizId}/attempt`,
      { method: 'POST' },
    )
    if (!res.ok) { setLoading(false); return }
    const data = await res.json() as {
      attemptId: string
      timeLimit: number | null
      questions: QuizQuestion[]
    }
    setAttemptId(data.attemptId)
    setQuestions(data.questions)
    setTimeLimit(data.timeLimit)
    setPhase('TAKING')
    setLoading(false)
  }

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    const res = await fetch(
      `/api/student/subjects/${subjectId}/quizzes/${quizId}/attempt`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers }),
      },
    )
    if (res.ok) {
      const data = await res.json() as {
        score: number | null
        totalMarks: number | null
      }
      setScore(data.score)
      setTotalMarks(data.totalMarks)
      setPhase(data.score !== null ? 'RESULTS' : 'SUBMITTED')
    }
    setLoading(false)
  }, [subjectId, quizId, attemptId, answers])

  const setAnswer = (qId: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }))
  }

  if (phase === 'INTRO') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <h2 className="text-xl font-bold">Ready to start?</h2>
        <p className="text-sm text-muted-foreground">
          Once started, you cannot pause the quiz.
        </p>
        <Button onClick={handleStart} disabled={loading} className="min-h-[44px]">
          {loading ? 'Starting...' : 'Start Quiz'}
        </Button>
      </div>
    )
  }

  if (phase === 'SUBMITTED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold">Quiz Submitted</h2>
        <p className="text-muted-foreground">
          Results will be available later.
        </p>
      </div>
    )
  }

  if (phase === 'RESULTS') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold">Results</h2>
        <div className="text-4xl font-bold text-primary">
          {score}/{totalMarks}
        </div>
      </div>
    )
  }

  const q = questions[currentQ]

  return (
    <div className="space-y-4">
      {timeLimit && (
        <QuizTimer minutes={timeLimit} onExpire={handleSubmit} />
      )}

      {/* Question dots nav */}
      <div className="flex gap-1.5 flex-wrap">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            onClick={() => setCurrentQ(i)}
            className={`h-8 w-8 rounded-full text-xs font-medium
              min-h-[44px] min-w-[44px] flex items-center justify-center
              ${i === currentQ ? 'bg-primary text-primary-foreground' :
                answers[qq.id] ? 'bg-green-100 text-green-700' :
                'bg-muted text-muted-foreground'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {q && <QuizQuestionView q={q} answer={answers[q.id]} setAnswer={setAnswer} />}

      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((p) => p - 1)}
          className="min-h-[44px]"
        >
          Previous
        </Button>
        {currentQ < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQ((p) => p + 1)}
            className="min-h-[44px]"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-h-[44px]"
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  )
}

function QuizQuestionView({
  q,
  answer,
  setAnswer,
}: {
  q: { id: string; type: string; text: string; options: string[]; marks: number }
  answer: string | string[] | undefined
  setAnswer: (qId: string, val: string | string[]) => void
}) {
  const strAnswer = typeof answer === 'string' ? answer : ''
  const arrAnswer = Array.isArray(answer) ? answer : []

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="font-medium">{q.text}</p>
      <p className="text-xs text-muted-foreground">{q.marks} marks</p>

      {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && (
        <div className="space-y-2">
          {(q.type === 'TRUE_FALSE' ? ['True', 'False'] : q.options).map(
            (opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(q.id, opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border
                  min-h-[44px] text-sm transition-colors
                  ${strAnswer === opt
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted'}`}
              >
                {opt}
              </button>
            ),
          )}
        </div>
      )}

      {q.type === 'MULTI_SELECT' && (
        <div className="space-y-2">
          {q.options.map((opt) => {
            const selected = arrAnswer.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => {
                  const next = selected
                    ? arrAnswer.filter((a) => a !== opt)
                    : [...arrAnswer, opt]
                  setAnswer(q.id, next)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border
                  min-h-[44px] text-sm transition-colors
                  ${selected
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted'}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {q.type === 'SHORT' && (
        <Input
          value={strAnswer}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder="Your answer"
          className="min-h-[44px]"
        />
      )}

      {q.type === 'LONG' && (
        <Textarea
          value={strAnswer}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder="Your answer"
          rows={4}
        />
      )}
    </div>
  )
}
