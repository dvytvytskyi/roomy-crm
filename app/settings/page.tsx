'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import SettingsSimple from '../../components/settings/SettingsSimple'

export default function SettingsPage() {

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      <div className="flex-1 overflow-y-auto" style={{ marginTop: '64px' }}>
        <SettingsSimple />
      </div>
    </div>
  )
}