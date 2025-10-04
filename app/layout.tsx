import type { Metadata } from 'next'
import './globals.css'
import ApiStatus from '../components/ApiStatus'
import ClientAuthGuard from '../components/ClientAuthGuard'
import ToastProvider from '../lib/components/ToastProvider'

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
      <head>
        {/* Bryntum Scheduler CSS */}
        <link rel="stylesheet" href="/build/scheduler.stockholm.css" />
        {/* Bryntum Scheduler UMD */}
        <script src="/build/scheduler.umd.js" />
      </head>
      <body className="antialiased">
      <ToastProvider />
      <ClientAuthGuard>
        {children}
      </ClientAuthGuard>
        <ApiStatus />
      </body>
    </html>
  )
}
