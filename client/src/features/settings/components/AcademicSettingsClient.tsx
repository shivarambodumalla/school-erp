'use client'

import { useCallback, useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from
  '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import type { ExamTypeRow } from '@/features/gradebook/types'

interface Props {
  examTypes: ExamTypeRow[]
  attendanceMode: string
}

export function AcademicSettingsClient({
  examTypes: initial,
  attendanceMode: initialMode,
}: Props) {
  const { apiParam } = useInstitutionId()
  const [examTypes, setExamTypes] = useState(initial)
  const [mode, setMode] = useState(initialMode)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newShort, setNewShort] = useState('')
  const [newWeight, setNewWeight] = useState(0)
  const [saving, setSaving] = useState(false)

  const totalWeightage = examTypes.reduce(
    (s, e) => s + e.weightage, 0,
  )

  const refreshExamTypes = useCallback(async () => {
    const res = await fetch(`/api/school/settings/exam-types${apiParam}`)
    if (res.ok) setExamTypes(await res.json())
  }, [apiParam])

  const addExamType = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/school/settings/exam-types${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          shortName: newShort,
          weightage: newWeight,
          order: examTypes.length,
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        setNewName('')
        setNewShort('')
        setNewWeight(0)
        await refreshExamTypes()
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteExamType = async (id: string) => {
    const res = await fetch(`/api/school/settings/exam-types/${id}${apiParam}`, {
      method: 'DELETE',
    })
    if (res.ok) await refreshExamTypes()
  }

  const toggleFinal = async (et: ExamTypeRow) => {
    await fetch(`/api/school/settings/exam-types/${et.id}${apiParam}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countInFinalGrade: !et.countInFinalGrade,
      }),
    })
    await refreshExamTypes()
  }

  const updateMode = async (newMode: string) => {
    setMode(newMode)
    await fetch(`/api/school/settings/attendance-mode${apiParam}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode }),
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Academic Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure exam types and attendance mode
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Exam Types</span>
            <Button
              size="sm"
              className="min-h-[44px]"
              onClick={() => setShowAdd(!showAdd)}
            >
              {showAdd ? 'Cancel' : 'Add'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${totalWeightage}%` }}
            />
            <span className="text-sm text-muted-foreground">
              {totalWeightage}%
            </span>
          </div>

          {showAdd && (
            <div className="flex flex-wrap gap-2 items-end
              border rounded-lg p-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Mid Term"
                />
              </div>
              <div className="space-y-1">
                <Label>Short</Label>
                <Input
                  value={newShort}
                  onChange={(e) => setNewShort(e.target.value)}
                  placeholder="MT"
                  className="w-20"
                />
              </div>
              <div className="space-y-1">
                <Label>Weight %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100 - totalWeightage}
                  value={newWeight}
                  onChange={(e) =>
                    setNewWeight(Number(e.target.value))
                  }
                  className="w-20"
                />
              </div>
              <Button
                className="min-h-[44px]"
                onClick={addExamType}
                disabled={saving || !newName || !newShort}
              >
                Save
              </Button>
            </div>
          )}

          <div className="divide-y rounded-lg border">
            {examTypes.map((et) => (
              <div
                key={et.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{et.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {et.shortName} &middot; {et.weightage}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={et.countInFinalGrade}
                    onCheckedChange={() => toggleFinal(et)}
                  />
                  <span className="text-xs">Final</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] text-destructive"
                  onClick={() => deleteExamType(et.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
            {examTypes.length === 0 && (
              <p className="px-4 py-6 text-center
                text-muted-foreground">
                No exam types configured yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['DAILY', 'PERIOD', 'BOTH'].map((m) => (
              <button
                key={m}
                className={`min-h-[44px] px-4 py-2 rounded-lg
                  text-sm font-medium border transition-colors ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => updateMode(m)}
              >
                {m === 'BOTH' ? 'Daily + Period' : m}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Daily: one entry per student per day. Period: per
            subject/period. Both: allows both modes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
