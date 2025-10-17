'use client'

import AuthGuard from '@/components/AuthGuard'
import { DashboardLayout } from '@/components/dashboard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  )
}