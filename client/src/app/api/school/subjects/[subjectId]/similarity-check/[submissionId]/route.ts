import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; submissionId: string }> }

/**
 * Tokenize text into a set of normalized tokens.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2)
  )
}

/**
 * Compute Jaccard similarity between two token sets.
 * Returns a value between 0 and 100.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0
  let intersection = 0
  for (const token of Array.from(a)) {
    if (b.has(token)) intersection++
  }
  const union = a.size + b.size - intersection
  return union > 0 ? Math.round((intersection / union) * 100) : 0
}

// POST /api/school/subjects/[subjectId]/similarity-check/[submissionId]
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, submissionId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const submission = await prisma.subjectAssignmentSubmission.findFirst({
    where: { id: submissionId },
    include: { assignment: true },
  })
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (!submission.textContent) {
    return NextResponse.json(
      { error: 'No text content to check' },
      { status: 400 }
    )
  }

  const targetTokens = tokenize(submission.textContent)

  // Get all other submissions for the same assignment
  const otherSubmissions = await prisma.subjectAssignmentSubmission.findMany({
    where: {
      assignmentId: submission.assignmentId,
      id: { not: submissionId },
      textContent: { not: null },
    },
    select: { id: true, textContent: true },
  })

  let maxScore = 0
  const matchedIds: string[] = []

  for (const other of otherSubmissions) {
    if (!other.textContent) continue
    const otherTokens = tokenize(other.textContent)
    const score = jaccardSimilarity(targetTokens, otherTokens)

    if (score > maxScore) maxScore = score
    if (score >= (submission.assignment.similarityThreshold ?? 70)) {
      matchedIds.push(other.id)
    }
  }

  const flagged = maxScore >= (submission.assignment.similarityThreshold ?? 70)

  // Upsert similarity result
  const similarityResult = await prisma.similarityCheckResult.upsert({
    where: { submissionId },
    create: {
      submissionId,
      checkScore: maxScore,
      matchedSubmissionIds: matchedIds,
      flagged,
    },
    update: {
      checkScore: maxScore,
      matchedSubmissionIds: matchedIds,
      flagged,
      checkedAt: new Date(),
    },
  })

  // Update the submission similarity score
  await prisma.subjectAssignmentSubmission.update({
    where: { id: submissionId },
    data: { similarityScore: maxScore },
  })

  return NextResponse.json(similarityResult)
}
