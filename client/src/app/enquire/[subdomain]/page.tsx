import { EnquiryForm } from '@/features/admissions/components/EnquiryForm'

interface PageProps {
  params: Promise<{ subdomain: string }>
}

export default async function EnquirePage({ params }: PageProps) {
  const { subdomain } = await params
  return <EnquiryForm subdomain={subdomain} />
}
