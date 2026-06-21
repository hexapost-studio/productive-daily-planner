import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Quicksand } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

const quicksand = Quicksand({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Productive Daily Planner',
  description: 'Planifie ton jour. Pilote ta semaine. Avance sur tes projets.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PDP',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport = {
  themeColor: '#8D4B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
