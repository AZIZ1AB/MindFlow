import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindFlow – AI Mental Health Check-In',
  description: 'MindFlow has a gentle conversation with you and uses AI to detect early signs of depression and recommend personalized support.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
