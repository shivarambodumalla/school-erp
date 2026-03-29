import { prisma } from '@/lib/prisma'
import { AdmissionSettingsClient } from
  '@/features/settings/components/AdmissionSettingsClient'

export default async function SuperManageAdmissionSettings({
  params,
}: {
  params: { institutionId: string }
}) {
  const institutionId = params.institutionId

  const [settings, documentTypes] = await Promise.all([
    prisma.admissionSettings.upsert({
      where: { institutionId },
      create: { institutionId },
      update: {},
    }),
    prisma.documentTypeConfig.findMany({
      where: { institutionId },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <AdmissionSettingsClient
      settings={JSON.parse(JSON.stringify(settings))}
      documentTypes={JSON.parse(JSON.stringify(documentTypes))}
    />
  )
}
