'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ActivityRow from '@/components/activity/activity-row'
import BrowseAll from '@/components/browse-all'
import Footer from '@/components/Footer'
import LogActivityModal from '@/components/LogActivityModal'
import { TRENDING, OFF_CAMPUS, ON_CAMPUS } from '@/lib/mock-activities'

// combine all activities for the browse all grid
const ALL_ACTIVITIES = [...TRENDING, ...OFF_CAMPUS, ...ON_CAMPUS]

export default function Home() {
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [initialLogQuery, setInitialLogQuery] = useState('')

  function openLogModal(query = '') {
    setInitialLogQuery(query.trim())
    setLogModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onLogActivity={openLogModal} />

      <main className="px-[90px] py-[48px] flex flex-col gap-[48px]">
        <ActivityRow title="Trending"    activities={TRENDING}   />
        <ActivityRow title="Off-Campus"  activities={OFF_CAMPUS} />
        <ActivityRow title="On-Campus"   activities={ON_CAMPUS}  />
        <BrowseAll activities={ALL_ACTIVITIES} />
      </main>
      <Footer />

      {logModalOpen ? (
        <LogActivityModal
          initialQuery={initialLogQuery}
          onClose={() => setLogModalOpen(false)}
          onLogged={() => setLogModalOpen(false)}
        />
      ) : null}
    </div>
  )
}
