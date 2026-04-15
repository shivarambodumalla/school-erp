import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { csvLeadRowSchema } from '@/features/leads/schemas/leadSchema'
import type { LeadSource } from '@prisma/client'

interface ParsedCsvRow {
  name: string
  phone: string
  email?: string
  source?: string
  targetClass?: string
  notes?: string
}

function parseCsv(text: string): ParsedCsvRow[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))

  const nameIdx = headers.findIndex(h => h === 'name' || h === 'student name')
  const phoneIdx = headers.findIndex(h => h === 'phone' || h === 'parent phone' || h === 'mobile')
  const emailIdx = headers.findIndex(h => h === 'email' || h === 'parent email')
  const sourceIdx = headers.findIndex(h => h === 'source')
  const classIdx = headers.findIndex(h => h === 'class' || h === 'target class' || h === 'targetclass')
  const notesIdx = headers.findIndex(h => h === 'notes' || h === 'message')

  if (nameIdx === -1 || phoneIdx === -1) return []

  const rows: ParsedCsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    if (!cols[nameIdx] || !cols[phoneIdx]) continue

    rows.push({
      name: cols[nameIdx],
      phone: cols[phoneIdx],
      email: emailIdx >= 0 ? cols[emailIdx] : undefined,
      source: sourceIdx >= 0 ? cols[sourceIdx] : undefined,
      targetClass: classIdx >= 0 ? cols[classIdx] : undefined,
      notes: notesIdx >= 0 ? cols[notesIdx] : undefined,
    })
  }
  return rows
}

/** POST /api/school/leads/import — CSV import */
export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const contentType = req.headers.get('content-type') ?? ''
  let csvText = ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'CSV file required' }, { status: 400 })
    }
    csvText = await file.text()
  } else {
    const body = (await req.json()) as { csv?: string }
    csvText = body.csv ?? ''
  }

  if (!csvText.trim()) {
    return NextResponse.json({ error: 'Empty CSV' }, { status: 400 })
  }

  const rows = parseCsv(csvText)
  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'No valid rows found. Requires name and phone columns.' },
      { status: 400 },
    )
  }

  // Resolve class templates for matching
  const classTemplates = await prisma.classTemplate.findMany({
    where: { institutionId },
    select: { id: true, name: true },
  })
  const classMap = new Map(classTemplates.map(c => [c.name.toLowerCase(), c.id]))

  const validSources = new Set(['WALK_IN', 'WEBSITE', 'SOCIAL', 'REFERRAL', 'OTHER'])

  let imported = 0
  let skipped = 0
  const errors: Array<{ row: number; error: string }> = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const parsed = csvLeadRowSchema.safeParse(row)
    if (!parsed.success) {
      errors.push({ row: i + 2, error: 'Invalid data' })
      skipped++
      continue
    }

    const sourceValue = row.source?.toUpperCase() ?? 'OTHER'
    const resolvedSource: LeadSource = validSources.has(sourceValue)
      ? (sourceValue as LeadSource)
      : 'OTHER'

    const targetClassId = row.targetClass
      ? classMap.get(row.targetClass.toLowerCase()) ?? null
      : null

    try {
      await prisma.lead.create({
        data: {
          institutionId,
          name: row.name.trim(),
          phone: row.phone.trim(),
          email: row.email?.trim() || null,
          source: resolvedSource,
          targetClassId,
          notes: row.notes?.trim() || null,
        },
      })
      imported++
    } catch {
      errors.push({ row: i + 2, error: 'Database error' })
      skipped++
    }
  }

  return NextResponse.json({ imported, skipped, errors })
}
