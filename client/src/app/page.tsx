import type { Metadata } from 'next'
import HomeClient from './_home/HomeClient'

export const metadata: Metadata = {
  title: 'Onflows — Your school. In flow.',
  description:
    'The all-in-one School ERP + LMS + Community platform. Streamline admissions, attendance, fees, grades, communications, and more — built for modern Indian schools.',
  openGraph: {
    title: 'Onflows — Your school. In flow.',
    description: 'Multi-tenant School ERP + LMS + Community platform for modern schools.',
    url: 'https://onflows.app',
    siteName: 'Onflows',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onflows — Your school. In flow.',
    description: 'The all-in-one School ERP + LMS + Community platform.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onflows.app' },
}

export default function HomePage(): JSX.Element {
  return <HomeClient />
}
