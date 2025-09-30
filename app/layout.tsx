import type { Metadata } from 'next'
import './globals.css'
import ApiStatus from '../components/ApiStatus'
import ClientAuthGuard from '../components/ClientAuthGuard'

export const metadata: Metadata = {
  title: 'Roomy CRM - Property Management',
  description: 'Property management and booking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientAuthGuard>
          {children}
        </ClientAuthGuard>
        <ApiStatus />
      </body>
    </html>
  )
}
