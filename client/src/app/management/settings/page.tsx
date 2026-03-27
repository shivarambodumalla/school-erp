import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InstitutionDetailsTab } from
  '@/features/school/components/InstitutionDetailsTab'

export default async function SettingsDetailsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const institution = await prisma.institution.findUnique({
    where: { id: session.user.institutionId },
    select: {
      name: true,
      subdomain: true,
      board: true,
      institutionType: true,
      phone: true,
      website: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pinCode: true,
      establishedYear: true,
      studentCapacity: true,
    },
  })

  if (!institution) redirect('/management/dashboard')

  return <InstitutionDetailsTab institution={institution} />
}