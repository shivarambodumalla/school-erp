import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { MasqueradeBar } from "@/components/shared/MasqueradeBar";
import { MasqueradeFrame } from "@/components/shared/MasqueradeFrame";
import { MasqueradeReadOnlyOverlay } from "@/components/shared/MasqueradeReadOnlyOverlay";

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
  title: "School ERP",
  description: "Multi-tenant School ERP — Admin, Teacher, Student, Parent, Instructor",
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
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
