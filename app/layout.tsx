import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roomy CRM - Property Management',
  description: 'Property management calendar and booking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
