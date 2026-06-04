'use client'

import { useState, useCallback } from 'react'
import ActivityRow from '@/components/activity/activity-row'
import BrowseAll from '@/components/browse-all'
import ActivityDetailModal from '@/components/activity/activity-detail-modal'
import { type Activity } from '@/lib/mock-activities'

type Props = {
  trending: Activity[]
  offCampus: Activity[]
  onCampus: Activity[]
  all: Activity[]
}

export default function HomeClient({ trending, offCampus, onCampus, all }: Props) {
  const [selected, setSelected] = useState<Activity | null>(null)
  const clearSelected = useCallback(() => setSelected(null), [])

  return (
    <>
      <main className="px-[90px] py-[48px] flex flex-col gap-[48px]">
        <ActivityRow title="Trending"   activities={trending}  onSelect={setSelected} />
        <ActivityRow title="Off-Campus" activities={offCampus} onSelect={setSelected} />
        <ActivityRow title="On-Campus"  activities={onCampus}  onSelect={setSelected} />
        <BrowseAll activities={all} onSelect={setSelected} />
      </main>

      {selected && (
        <ActivityDetailModal activity={selected} onClose={clearSelected} />
      )}
    </>
  )
}
