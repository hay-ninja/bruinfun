'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ActivityRow from '@/components/activity/activity-row'
import BrowseAll from '@/components/browse-all'
import Footer from '@/components/Footer'
import LogActivityModal from '@/components/LogActivityModal'
import { type Activity } from '@/lib/activity-ui'

type Props = {
  trending: Activity[]
  offCampus: Activity[]
  onCampus: Activity[]
  all: Activity[]
}

export default function HomeClient({ trending, offCampus, onCampus, all }: Props) {
  const [logModalOpen, setLogModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Header onLogActivity={() => setLogModalOpen(true)} />

      <main className="px-[90px] py-[48px] flex flex-col gap-[48px]">
        <ActivityRow title="Trending" activities={trending} />
        <ActivityRow title="Off-Campus" activities={offCampus} />
        <ActivityRow title="On-Campus" activities={onCampus} />
        <BrowseAll activities={all} />
      </main>
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
