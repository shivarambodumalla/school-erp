import { prisma } from '@/lib/prisma'

/**
 * Resolve a URL parameter that could be either a serialNo (numeric) or a CUID string.
 * Returns the CUID id for use in Prisma queries.
 */
export async function resolveClassYearId(rawId: string, institutionId: string): Promise<string | null> {
  const isNumeric = /^\d+$/.test(rawId)
  const classYear = await prisma.classYear.findFirst({
    where: {
      ...(isNumeric ? { serialNo: parseInt(rawId, 10) } : { id: rawId }),
      institutionId,
    },
    select: { id: true },
  })
  return classYear?.id ?? null
}

export async function resolveStudentId(rawId: string, institutionId: string): Promise<string | null> {
  const isNumeric = /^\d+$/.test(rawId)
  if (isNumeric) {
    const student = await prisma.student.findFirst({
      where: { serialNo: parseInt(rawId, 10), institutionId },
      select: { id: true },
    })
    return student?.id ?? null
  }
  return rawId
}

export async function resolveStaffId(rawId: string, institutionId: string): Promise<string | null> {
  const isNumeric = /^\d+$/.test(rawId)
  if (isNumeric) {
    const staff = await prisma.staff.findFirst({
      where: { serialNo: parseInt(rawId, 10), institutionId },
      select: { id: true },
    })
    return staff?.id ?? null
  }
  return rawId
}

export async function resolveAdmissionId(rawId: string, institutionId: string): Promise<string | null> {
  const isNumeric = /^\d+$/.test(rawId)
  if (isNumeric) {
    const admission = await prisma.admission.findFirst({
      where: { serialNo: parseInt(rawId, 10), institutionId },
      select: { id: true },
    })
    return admission?.id ?? null
  }
  return rawId
}
