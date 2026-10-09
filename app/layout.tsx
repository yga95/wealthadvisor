import type { Metadata } from 'next'
import { Geist, Unbounded } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const unbounded = Unbounded({ variable: '--font-unbounded', subsets: ['latin'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'WealthAdvisor',
  description: 'Client files, assets and AI-assisted recommendations for advisory firms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
