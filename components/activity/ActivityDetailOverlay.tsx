'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Utensils, Tag, Zap, Calendar, ArrowLeft, Bookmark, Users } from 'lucide-react'
import ActivityCommentsSection from '@/components/activity/activity-comments-section'
import { categoryLabel, toActivityCategory, type ActivityCategory } from '@/lib/activity-ui'

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  food: '#ff9502',
  outdoors: '#007aff',
  sports: '#4bb430',
  arts: '#a855f7',
  nightlife: '#ff2c55',
}

const CATEGORY_ICONS: Record<ActivityCategory, React.ReactNode> = {
  food: <Utensils size={10} strokeWidth={2.5} />,
  outdoors: <MapPin size={10} strokeWidth={2.5} />,
  sports: <Zap size={10} strokeWidth={2.5} />,
  arts: <Tag size={10} strokeWidth={2.5} />,
  nightlife: <Calendar size={10} strokeWidth={2.5} />,
}

type CommentItem = {
  comment_id: number
  comment: string
  created_at: string | null
  rating: number | null
}

type PageActivity = {
  title: string
  category: string | null
  location: string | null
  avg_rating: number | null
  image_url: string | null
  description: string | null
}

type Props = {
  activityId: string
  pageActivity: PageActivity
  initialComments: CommentItem[]
  commentsError: boolean
  attendeeCount?: number
  tags?: string[]
}

export default function ActivityDetailOverlay({
  activityId,
  pageActivity,
  initialComments,
  commentsError,
  attendeeCount,
  tags,
}: Props) {
  const router = useRouter()
  const [show, setShow] = useState(false)

  const close = useCallback(() => {
    setShow(false)
    setTimeout(() => router.back(), 200)
  }, [router])

  useEffect(() => {
    setShow(true)
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [close])

  const category = toActivityCategory(pageActivity.category)
  const badgeColor = category ? CATEGORY_COLORS[category] : '#007aff'
  const badgeIcon = category ? CATEGORY_ICONS[category] : null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={close}
    >
      <div
        className={`bg-white rounded-[50px] w-[950px] max-w-[95vw] max-h-[90vh] overflow-y-auto transition-all duration-200 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {/* sticky header */}
        <div className="pb-2 flex flex-row items-center justify-between w-full bg-white sticky top-0 z-50">
          <div className="pt-[37px] px-[41px]">
            <button
              onClick={close}
              className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.5)] border border-[#d7d7d7] rounded-full px-[16px] py-[8px] text-[14.865px] font-medium text-black hover:bg-white transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>

          <div className="flex flex-row gap-[12px]">
            <div className="pt-[37px]">
              <button className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.5)] border border-[#d7d7d7] rounded-full px-[16px] py-[8px] text-[14.865px] font-medium text-black hover:bg-white transition-colors">
                <Bookmark size={14} />
                Save
              </button>
            </div>
            <div className="pt-[37px] pr-[41px]">
              <button className="flex items-center bg-[#1f93cd] px-[16px] py-[8px] text-[#eaf4fa] text-[14.865px] font-medium rounded-full hover:bg-[rgb(21,115,166)] transition-colors">
                Log
              </button>
            </div>
          </div>
        </div>

        {/* main content */}
        <div className="px-[41px] pt-[20px] pb-[52px]">
          <div className="flex gap-[24px]">

            {/* left: text content */}
            <div className="flex-1 flex flex-col gap-[18px] min-w-0">
              <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20] leading-tight">
                {pageActivity.title}
              </h1>

              <div className="flex flex-row items-center gap-[16px]">
                {pageActivity.avg_rating != null && (
                  <div className="flex items-center gap-[4px]">
                    <span className="text-[#edb721] text-[18px] leading-none">★</span>
                    <span className="text-[16px] font-medium text-black">{pageActivity.avg_rating}</span>
                  </div>
                )}
                {category && (
                  <div
                    className="flex w-[fit-content] items-center gap-[3.5px] text-white px-[10px] py-[5px] rounded-full shadow-[0px_1.68px_1.68px_0px_rgba(0,0,0,0.05)]"
                    style={{ backgroundColor: badgeColor }}
                  >
                    {badgeIcon}
                    <span className="text-[14px] font-semibold leading-none">{categoryLabel(category)}</span>
                  </div>
                )}
              </div>

              {pageActivity.location && (
                <div className="flex items-center gap-[6px]">
                  <MapPin size={16} className="text-[#a0a3a8] shrink-0" />
                  <span className="text-[16px] text-[#a0a3a8]">{pageActivity.location}</span>
                </div>
              )}

              {attendeeCount != null && (
                <div className="flex items-center gap-[6px] text-[#a0a3a8]">
                  <Users size={16} />
                  <span className="text-[16px]">{attendeeCount} experienced</span>
                </div>
              )}

              {tags && tags.length > 0 && (
                <div className="flex items-center gap-[6px] flex-wrap">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[14px] font-semibold text-[#323232] bg-[rgba(255,255,255,0.8)] border border-[rgba(166,166,166,0.8)] px-[10px] py-[5px] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {pageActivity.description && (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#323232]">
                  {pageActivity.description}
                </p>
              )}
            </div>

            {/* right: image */}
            <div className="w-[409px] shrink-0">
              <div className="w-full h-[307px] rounded-[20px] overflow-hidden">
                {pageActivity.image_url ? (
                  <img
                    src={pageActivity.image_url}
                    alt={pageActivity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#dff3fb] px-8 text-center font-[family-name:var(--font-nunito)] text-[24px] font-semibold text-[#1f93cd]">
                    {pageActivity.title}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ActivityCommentsSection
            activityId={activityId}
            initialComments={initialComments}
            loadError={commentsError}
          />
        </div>
      </div>
    </div>
  )
}
