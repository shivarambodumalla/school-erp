'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Trophy, Users, CalendarDays, ArrowLeft,
} from 'lucide-react'
import { LIST_PAGE_CLASS } from '@/lib/table-constants'

interface MeritConfig {
  id: string
  name: string
  totalSeats: number
  cutoffScore: number | null
  publishedAt: string | null
  createdAt: string
  targetClass: { id: string; name: string }
  academicYear: { id: string; name: string }
  _count: { entries: number }
}

interface ClassOption {
  id: string
  name: string
}

interface AcademicYearOption {
  id: string
  name: string
}

function getStatusLabel(config: MeritConfig): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  if (config.publishedAt) return { label: 'Published', variant: 'default' }
  if (config._count.entries > 0) return { label: 'Generated', variant: 'secondary' }
  return { label: 'Draft', variant: 'outline' }
}

export function MeritListClient() {
  const { addParams } = useInstitutionId()
  const { toast } = useToast()

  const [configs, setConfigs] = useState<MeritConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [targetClassId, setTargetClassId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [totalSeats, setTotalSeats] = useState('')
  const [cutoffScore, setCutoffScore] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Options for dropdowns
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([])

  const fetchConfigs = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    addParams(params)
    fetch(`/api/school/merit-list?${params}`)
      .then(r => r.json())
      .then((data: { configs: MeritConfig[] }) => setConfigs(data.configs ?? []))
      .catch(() => toast({ title: 'Failed to load merit lists', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [addParams, toast])

  const fetchOptions = useCallback(() => {
    const params = new URLSearchParams()
    addParams(params)

    Promise.all([
      fetch(`/api/school/classes?${params}`).then(r => r.json()),
      fetch(`/api/school/academic-years?${params}`).then(r => r.json()),
    ]).then(([classData, yearData]) => {
      const cls = Array.isArray(classData)
        ? classData as ClassOption[]
        : (classData as { classes?: ClassOption[] }).classes ?? []
      setClasses(cls)

      const yrs = Array.isArray(yearData)
        ? yearData as AcademicYearOption[]
        : (yearData as { years?: AcademicYearOption[] }).years ?? []
      setAcademicYears(yrs)
    }).catch(() => { /* Options will be empty if API fails */ })
  }, [addParams])

  useEffect(() => { fetchConfigs() }, [fetchConfigs])

  const openCreateSheet = () => {
    setName('')
    setTargetClassId('')
    setAcademicYearId('')
    setTotalSeats('')
    setCutoffScore('')
    fetchOptions()
    setSheetOpen(true)
  }

  const handleCreate = async () => {
    if (!name.trim() || !targetClassId || !academicYearId || !totalSeats) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(`/api/school/merit-list?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          targetClassId,
          academicYearId,
          totalSeats: Number(totalSeats),
          cutoffScore: cutoffScore ? Number(cutoffScore) : null,
          rankingCriteria: {},
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to create merit list')
      }
      toast({ title: 'Merit list created' })
      setSheetOpen(false)
      fetchConfigs()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/management/admissions"
            className="inline-flex items-center justify-center rounded-md h-9 w-9
              hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Merit Lists</h1>
          {configs.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full
              bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
              {configs.length}
            </span>
          )}
        </div>
        <Button onClick={openCreateSheet} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Merit List
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border p-5 space-y-3">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-semibold mb-1">No merit lists yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Create a merit list to rank and select applicants for a class.
            </p>
            <Button onClick={openCreateSheet} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Merit List
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map(config => {
              const status = getStatusLabel(config)
              return (
                <Link
                  key={config.id}
                  href={`/management/admissions/merit-list/${config.id}`}
                  className="rounded-xl border p-5 hover:bg-muted/50 transition-colors
                    flex flex-col gap-3 min-h-[44px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                      {config.name}
                    </h3>
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {config.academicYear.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {config.targetClass.name} &middot; {config.totalSeats} seats
                    </div>
                    {config._count.entries > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 shrink-0" />
                        {config._count.entries} entries
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b">
            <SheetTitle className="text-base">Create Merit List</SheetTitle>
            <SheetDescription>
              Configure a merit list for a class and academic year
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="ml-name" className="text-sm font-medium">Name</Label>
              <Input
                id="ml-name"
                placeholder="e.g. Class 10 Merit List 2025"
                value={name}
                onChange={e => setName(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {/* Target Class */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Class</Label>
              <Select value={targetClassId} onValueChange={setTargetClassId}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Academic Year</Label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(y => (
                    <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total Seats */}
            <div className="space-y-2">
              <Label htmlFor="ml-seats" className="text-sm font-medium">Total Seats</Label>
              <Input
                id="ml-seats"
                type="number"
                min={1}
                placeholder="e.g. 40"
                value={totalSeats}
                onChange={e => setTotalSeats(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {/* Cutoff Score */}
            <div className="space-y-2">
              <Label htmlFor="ml-cutoff" className="text-sm font-medium">
                Cutoff Score <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="ml-cutoff"
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="e.g. 50"
                value={cutoffScore}
                onChange={e => setCutoffScore(e.target.value)}
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground">
                Students scoring below this will be rejected
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t">
            <Button
              onClick={handleCreate}
              disabled={submitting || !name.trim() || !targetClassId || !academicYearId || !totalSeats}
              className="w-full min-h-[44px]"
            >
              {submitting ? 'Creating...' : 'Create Merit List'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
