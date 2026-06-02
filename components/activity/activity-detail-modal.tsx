'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapPin, Users, Utensils, Tag, Zap, Calendar, ArrowLeft, Bookmark } from 'lucide-react'
import { type Activity } from '@/lib/mock-activities'

type Category = 'Restaurant' | 'Place' | 'Service' | 'Product' | 'Event'

const CATEGORY_COLORS: Record<Category, string> = {
  Restaurant: '#ff9502',
  Place:      '#007aff',
  Service:    '#4bb430',
  Product:    '#ff2c55',
  Event:      '#a855f7',
}

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Restaurant: <Utensils size={10} strokeWidth={2.5} />,
  Place:      <MapPin   size={10} strokeWidth={2.5} />,
  Service:    <Zap      size={10} strokeWidth={2.5} />,
  Product:    <Tag      size={10} strokeWidth={2.5} />,
  Event:      <Calendar size={10} strokeWidth={2.5} />,
}

type Props = {
  activity: Activity
  onClose: () => void
}

export default function ActivityDetailModal({ activity, onClose }: Props) {
  const [show, setShow] = useState(false)

  const handleClose = useCallback(() => {
    setShow(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    setShow(true)
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [handleClose])

  const badgeColor = CATEGORY_COLORS[activity.category]
  const badgeIcon  = CATEGORY_ICONS[activity.category]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-[50px] w-[953px] max-w-[95vw] max-h-[90vh] overflow-y-auto transition-all duration-200 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-row items-center justify-between">
          {/* back button */}
          <div className="pt-[37px] px-[41px]">
            <button
              onClick={handleClose}
              className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.5)] border border-[#d7d7d7] rounded-full px-[16px] py-[8px] text-[14.865px] font-medium text-black hover:bg-white transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>

          {/* save button */}
          <div className="pt-[37px] px-[41px]">
            <button
              //onClick={saveActivity}
              className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.5)] border border-[#d7d7d7] rounded-full px-[16px] py-[8px] text-[14.865px] font-medium text-black hover:bg-white transition-colors"
            >
              <Bookmark size={14} />
              Save
            </button>
          </div>
        </div>

        {/* main content: left text + right image */}
        <div className="flex gap-[32px] px-[41px] pt-[20px] pb-[52px]">

          {/* left: text content */}
          <div className="flex-1 flex flex-col gap-[18px] min-w-0">
            <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20] leading-tight">
              {activity.title}
            </h1>

            <div className="flex flex-row items-center gap-[16px]">
              {/* rating + category badge */}
              <div className="flex items-center gap-[4px]">
                <span className="text-[#edb721] text-[18px] leading-none">★</span>
                <span className="text-[16px] font-medium text-black">{activity.rating}</span>
              </div>

              {/* category badge */}
              <div
                  className="flex w-[fit-content] items-center gap-[3.5px] text-white px-[10px] py-[5px] rounded-full shadow-[0px_1.68px_1.68px_0px_rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: badgeColor }}
              >
                  {badgeIcon}
                  <span className="text-[14px] font-semibold leading-none">{activity.category}</span>
              </div>
            </div>

            {/* location */}
            <div className="flex items-center gap-[6px]">
              <MapPin size={16} className="text-[#a0a3a8] shrink-0" />
              <span className="text-[16px] text-[#a0a3a8]">{activity.location}</span>
            </div>

            {/* attendees */}
            <div className="flex items-center gap-[6px] text-[#a0a3a8]">
              <Users size={16} />
              <span className="text-[16px]">{activity.attendeeCount} going</span>
            </div>

            {/* tags */}
            {activity.tags.length > 0 && (
              <div className="flex items-center gap-[6px] flex-wrap">
                {activity.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[14px] font-semibold text-[#323232] bg-[rgba(255,255,255,0.8)] border border-[rgba(166, 166, 166, 0.8)] px-[10px] py-[5px] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* right: image */}
          <div className="w-[409px] shrink-0">
            <div className="w-full h-[307px] rounded-[20px] overflow-hidden">
              <img
                src={activity.imageUrl}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
