'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import HomeClient from '@/components/home-client'
import Footer from '@/components/Footer'
import LogActivityModal from '@/components/LogActivityModal'
import { TRENDING, OFF_CAMPUS, ON_CAMPUS } from '@/lib/mock-activities'

const ALL_ACTIVITIES = [...TRENDING, ...OFF_CAMPUS, ...ON_CAMPUS]

export default function Home() {
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [initialLogQuery, setInitialLogQuery] = useState('')

  function openLogModal() {
    setInitialLogQuery('')
    setLogModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onLogActivity={() => setLogModalOpen(true)} />

      <HomeClient
        trending={TRENDING}
        offCampus={OFF_CAMPUS}
        onCampus={ON_CAMPUS}
        all={ALL_ACTIVITIES}
      />
      <Footer />

      {logModalOpen && (
        <LogActivityModal
          initialQuery=""
          onClose={() => setLogModalOpen(false)}
          onLogged={() => setLogModalOpen(false)}
        />
      )}
    </div>
  )
}
