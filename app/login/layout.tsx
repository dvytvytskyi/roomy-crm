import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Roomy CRM',
  description: 'Sign in to Roomy Property Management System',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
