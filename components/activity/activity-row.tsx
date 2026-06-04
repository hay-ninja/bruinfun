// a single "row" of activites: eg. the trending / off-campus row
'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ActivityCard from './activity-card'
import { type Activity } from '@/lib/activity-ui'

type ActivityRowProps = {
  title: string
  activities: Activity[]
  onSelect?: (activity: Activity) => void
}

export default function ActivityRow({ title, activities, onSelect }: ActivityRowProps) {
  // ref to the scroll div so the arrow button can move it
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // roughly one card width
  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 286, behavior: 'smooth' })
  }

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -286, behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-[16px] overflow-visible">

      {/* section title */}
      <h2 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-black tracking-[-0.28px]">
        {title}
      </h2>

      {/* relative so fade + arrow can sit on top */}
      {activities.length > 0 ? (
        <div className="relative">

        {/* inline style needed to hide scrollbar cross-browser, tailwind alone doesnt cut it */}
        <div
          ref={scrollRef}
          className="flex gap-[21px] overflow-x-auto p-5 -my-5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}
        >
          {activities.map((a) => (
            <ActivityCard key={a.id} {...a} onClick={onSelect ? () => onSelect(a) : undefined} />
          ))}
        </div>

        {/* button to scroll left that only appears when scrolled */}
        {scrolled && (
          <>
            <div className="absolute left-0 top-0 bottom-2 w-[180px] bg-gradient-to-l from-transparent via-white/50 to-white pointer-events-none" />
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[32px] h-[32px] bg-[rgba(255,255,255,0.5)] rounded-full shadow-[0px_2px_20px_-1px_rgba(0,0,0,0.2)] flex items-center justify-center pointer-events-auto"
            >
              <ChevronLeft size={16} className="text-black" />
            </button>
          </>
        )}

        {/* right edge fade, pointer-events-none so cards behind it are still clickable */}
        <div className="absolute right-0 top-0 bottom-2 w-[180px] bg-gradient-to-r from-transparent via-white/50 to-white pointer-events-none" />

        {/* arrow on top of the fade */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[32px] h-[32px] bg-[rgba(255,255,255,0.5)] rounded-full shadow-[0px_2px_20px_-1px_rgba(0,0,0,0.2)] flex items-center justify-center pointer-events-auto"
        >
          <ChevronRight size={16} className="text-black" />
        </button>
        </div>
      ) : (
        <div className="rounded-[24px] border border-[rgba(192,199,209,0.6)] bg-[rgba(255,255,255,0.5)] px-6 py-8 text-center text-[15px] text-[#6d7783]">
          No activities here yet.
        </div>
      )}
    </section>
  )
}
