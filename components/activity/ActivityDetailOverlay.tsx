'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import ActivityCommentsSection from '@/components/activity/activity-comments-section'

type CommentItem = {
  comment_id: number
  comment: string
  created_at: string | null
  rating: number | null
}

type DbActivity = {
  activity_id: number | string
  title: string
  description: string | null
  category: string | null
  location: string | null
  event_date: string | null
  image_url: string | null
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
  activityId: number
  pageActivity: PageActivity
  dbActivity?: DbActivity
  initialComments: CommentItem[]
  commentsError: boolean
  isLoggedIn: boolean
  existingRating: number | null
}

export default function ActivityDetailOverlay({
  activityId,
  pageActivity,
  dbActivity,
  initialComments,
  commentsError,
  isLoggedIn,
  existingRating,
}: Props) {
  const router = useRouter()
  const close = useCallback(() => router.back(), [router])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto"
      onClick={close}
    >
      <div
        className="relative mx-auto my-8 w-full max-w-2xl rounded-[24px] border border-[rgba(192,199,209,0.6)] bg-white shadow-[0px_16px_60px_-8px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button — floats over image if present */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white/80 text-[#6d7783] shadow backdrop-blur-sm hover:bg-white hover:text-[#191c20] transition-colors"
        >
          <X className="size-5" />
        </button>

        {pageActivity.image_url && (
          <img
            src={pageActivity.image_url}
            alt={pageActivity.title}
            className="h-[280px] w-full object-cover"
          />
        )}

        <div className="p-6">
          <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20] pr-8">
            {pageActivity.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#6d7783]">
            {pageActivity.category && (
              <span className="rounded-full bg-[#eef6fb] px-3 py-1 capitalize text-[#1f93cd] font-medium">
                {pageActivity.category}
              </span>
            )}
            {pageActivity.location && <span>{pageActivity.location}</span>}
            {pageActivity.avg_rating != null && (
              <span className="ml-auto font-semibold text-[#191c20]">
                {pageActivity.avg_rating} ★
              </span>
            )}
          </div>

          {pageActivity.description && (
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[#323232]">
              {pageActivity.description}
            </p>
          )}

          <ActivityCommentsSection
            activityId={activityId}
            initialComments={initialComments}
            loadError={commentsError}
            activity={dbActivity}
            isLoggedIn={isLoggedIn}
            existingRating={existingRating}
          />
        </div>
      </div>
    </div>
  )
}
