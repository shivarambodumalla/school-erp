import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { MasqueradeBar } from "@/components/shared/MasqueradeBar";
import { MasqueradeFrame } from "@/components/shared/MasqueradeFrame";
import { MasqueradeReadOnlyOverlay } from "@/components/shared/MasqueradeReadOnlyOverlay";
import { Toaster } from 'sonner'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: 'Onflows',
    template: '%s | Onflows',
  },
  description: 'Your school. In flow.',
  applicationName: 'Onflows',
  keywords: [
    'school management',
    'ERP',
    'education',
    'LMS',
    'school software',
    'India',
  ],
  authors: [{ name: 'Onflows' }],
  creator: 'Onflows',
  metadataBase: new URL('https://onflows.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://onflows.app',
    title: 'Onflows',
    description: 'Your school. In flow.',
    siteName: 'Onflows',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onflows',
    description: 'Your school. In flow.',
    creator: '@onflows',
  },
  icons: {
    icon: '/images/logo-square.svg',
    apple: '/images/logo-square.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <MasqueradeFrame />
            <MasqueradeBar />
            <MasqueradeReadOnlyOverlay />
            <Toaster
              position="top-right"
              richColors
              closeButton
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
