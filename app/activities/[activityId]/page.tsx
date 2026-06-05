import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompleteActivityButton from '@/components/CompleteActivityButton'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ActivityCommentsSection from '@/components/activity/activity-comments-section'
import { getRequestUser } from '@/lib/auth'

type PageProps = {
  params: Promise<{ activityId: string }>
}

type ActivityComment = {
  comment_id: number
  comment: string
  created_at: string | null
  ratings: { rating: number } | { rating: number }[] | null
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const POSITIVE_INTEGER_PATTERN = /^\d+$/

export function toValidActivityId(activityId: string): string | null {
  if (UUID_PATTERN.test(activityId)) {
    return activityId
  }

  if (POSITIVE_INTEGER_PATTERN.test(activityId) && Number(activityId) > 0) {
    return activityId
  }

  return null
}

export function normalizeActivityComments(comments: ActivityComment[] | null | undefined) {
  return (comments ?? []).map((entry) => ({
    comment_id: entry.comment_id,
    comment: entry.comment,
    created_at: entry.created_at,
    rating: Array.isArray(entry.ratings) ? (entry.ratings[0]?.rating ?? null) : (entry.ratings?.rating ?? null),
  }))
}

export default async function ActivityDetailsPage({ params }: PageProps) {
  const { activityId } = await params
  const supabase = await createServerSupabaseClient()
  const auth = await getRequestUser()
  const user = auth.user

  const validId = toValidActivityId(activityId)

  if (!validId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-[90px] py-[48px]">
          <p className="text-red-500">Invalid activity id.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const [
    { data: activity, error },
    { data: comments, error: commentsError },
    { data: avgResult },
  ] = await Promise.all([
    supabase
      .from('activities')
      .select('activity_id, title, description, category, location, event_date, image_url, created_at')
      .eq('activity_id', validId)
      .single(),
    supabase
      .from('comments')
      .select('comment_id, comment, created_at, ratings(rating)')
      .eq('activity_id', validId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ratings')
      .select('rating.avg()')
      .eq('activity_id', validId)
      .single(),
  ])

  const isLoggedIn = !!user

  let existingRating: number | null = null
  if (user) {
    const { data: ratingRow } = await supabase
      .from('ratings')
      .select('rating')
      .eq('activity_id', validId)
      .eq('profile_id', user.id)
      .single()
    existingRating = ratingRow?.rating ?? null
  }

  const averageRating = avgResult?.avg != null ? Number(Number(avgResult.avg).toFixed(1)) : null

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-[90px] py-[48px]">
          <p className="text-red-500">Activity not found.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const initialComments = normalizeActivityComments((comments ?? []) as ActivityComment[])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-[90px] py-[48px]">
        <div className="mx-auto max-w-[920px] rounded-[24px] border border-[rgba(192,199,209,0.6)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[0px_1.68px_16.78px_-1px_rgba(0,0,0,0.12)]">
          {activity.image_url ? (
            <img
              src={activity.image_url}
              alt={activity.title}
              className="mb-6 h-[360px] w-full rounded-[16px] object-cover"
            />
          ) : null}

          <h1 className="font-[family-name:var(--font-nunito)] text-[36px] font-semibold text-[#191c20]">
            {activity.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6d7783]">
            <span className="rounded-full bg-[#eef6fb] px-3 py-1 capitalize">{activity.category ?? 'uncategorized'}</span>
            <span>{activity.location ?? 'Location unavailable'}</span>
            {averageRating != null ? <span>{averageRating} ★</span> : null}
          </div>

          <div className="mt-4">
            <CompleteActivityButton
              activity={activity}
              isLoggedIn={isLoggedIn}
              existingRating={existingRating}
            />
          </div>

          <p className="mt-6 whitespace-pre-wrap text-[16px] leading-relaxed text-[#323232]">
            {activity.description || 'No description available.'}
          </p>

          <ActivityCommentsSection
            activityId={validId}
            initialComments={initialComments}
            loadError={Boolean(commentsError)}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
