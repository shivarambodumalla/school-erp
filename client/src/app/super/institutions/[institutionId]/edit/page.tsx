import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { EditInstitutionForm } from './_components/EditInstitutionForm'

export default async function EditInstitutionPage({
  params,
}: {
  params: { institutionId: string }
}) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    redirect('/auth/login')
  }

  const institution = await prisma.institution.findUnique({
    where: { id: params.institutionId },
    select: {
      id: true, name: true, subdomain: true,
      institutionType: true, board: true,
      planTier: true, isActive: true,
      addressLine1: true, addressLine2: true,
      city: true, state: true, pinCode: true,
      phone: true, website: true,
      establishedYear: true, studentCapacity: true,
      billingEmail: true,
    },
  })

  if (!institution) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Institution</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update details for {institution.name}
        </p>
      </div>
      <EditInstitutionForm institution={institution} />
    </div>
  )
}
