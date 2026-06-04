'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Utensils, MapPin, Zap, Tag, Calendar } from 'lucide-react'
import ActivityCard from './activity/activity-card'
import { categoryLabel, type Activity, type ActivityCategory } from '@/lib/activity-ui'

// filter pill config, icon color matches the category badge color
const FILTERS: { label: string; category: ActivityCategory | null; icon: React.ReactNode; color: string }[] = [
  { label: 'All Activities', category: null,         icon: null,                   color: '' },
  { label: 'Food',           category: 'food',       icon: <Utensils size={12} />, color: '#ff9502' },
  { label: 'Outdoors',       category: 'outdoors',   icon: <MapPin   size={12} />, color: '#007aff' },
  { label: 'Sports',         category: 'sports',     icon: <Zap      size={12} />, color: '#4bb430' },
  { label: 'Arts',           category: 'arts',       icon: <Tag      size={12} />, color: '#a855f7' },
  { label: 'Nightlife',      category: 'nightlife',  icon: <Calendar size={12} />, color: '#ff2c55' },
]

const SORT_OPTIONS = ['Newest', 'Top Rated', 'Most Popular']
const PAGE_SIZE = 12

type BrowseAllProps = {
  activities: Activity[]
  onSelect?: (activity: Activity) => void
}

export default function BrowseAll({ activities, onSelect }: BrowseAllProps) {
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null)
  const [sort, setSort]                     = useState('Newest')
  const [showSortMenu, setShowSortMenu]     = useState(false)
  const [visibleCount, setVisibleCount]     = useState(PAGE_SIZE)

  // sentinel div at the bottom of the grid — IntersectionObserver watches it
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = activeCategory
    ? activities.filter(a => a.category === activeCategory)
    : activities

  const sorted = [...filtered].sort((left, right) => {
    if (sort === 'Top Rated') return right.rating - left.rating
    if (sort === 'Most Popular') return (right.attendeeCount ?? 0) - (left.attendeeCount ?? 0)
    return 0
  })
  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  // when sentinel enters the viewport, load the next batch
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount(c => c + PAGE_SIZE)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore])

  // reset visible count when filter changes
  function handleFilter(category: ActivityCategory | null) {
    setActiveCategory(category)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <section className="flex flex-col gap-[24px]">

      {/* title + filter bar */}
      <div className="flex flex-col gap-[14px]">
        <h2 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-black tracking-[-0.28px]">
          Browse All
        </h2>

        {/* filter pills + sort by on same row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-[7px]">
            {FILTERS.map(f => {
              const isActive = f.category === activeCategory
              return (
                <button
                  key={f.label}
                  onClick={() => handleFilter(f.category)}
                  className={`flex items-center gap-[5.5px] pl-[13px] pr-[16px] py-[8px] border border-[rgba(122, 122, 122, 0.88)] rounded-full text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-[rgba(255,255,255,0.5)] text-[#323232]'
                  }`}
                >
                  {f.icon && (
                    <span style={{ color: isActive ? 'white' : f.color }}>
                      {f.icon}
                    </span>
                  )}
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.5)] border border-[rgba(192,199,209,0.6)] rounded-full px-[15px] py-[8px] text-[13px]"
            >
              <span className="text-[rgba(25,28,32,0.5)]">Sort by:</span>
              <span className="text-[#191c20] font-semibold">{sort}</span>
              <ChevronDown size={12} className="text-[#191c20]" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(192,199,209,0.4)] overflow-hidden z-10 min-w-[140px]">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setShowSortMenu(false) }}
                    className={`w-full text-left px-[16px] py-[10px] text-[13px] font-semibold hover:bg-gray-50 ${opt === sort ? 'text-[#1f93cd]' : 'text-[#191c20]'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 col grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-4 gap-[28px]">
          {visible.map(a => (
            <ActivityCard
              key={a.id}
              {...a}
              className="w-full"
              onClick={onSelect ? () => onSelect(a) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-[rgba(192,199,209,0.6)] bg-[rgba(255,255,255,0.5)] px-6 py-8 text-center text-[15px] text-[#6d7783]">
          No {activeCategory ? categoryLabel(activeCategory).toLowerCase() : 'activities'} yet.
        </div>
      )}

      {/* sentinel — sits below the grid, invisible, triggers next load when scrolled into view */}
      <div ref={sentinelRef} className="h-px" />

    </section>
  )
}
