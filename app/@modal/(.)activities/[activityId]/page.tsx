import { createServerSupabaseClient } from '@/lib/supabase/server'
import ActivityDetailOverlay from '@/components/activity/ActivityDetailOverlay'
import { toValidActivityId, normalizeActivityComments } from '@/app/activities/[activityId]/page'
import { TRENDING, OFF_CAMPUS, ON_CAMPUS } from '@/lib/mock-activities'

type PageProps = {
  params: Promise<{ activityId: string }>
}

type ActivityComment = {
  comment_id: number
  comment: string
  created_at: string | null
  ratings: { rating: number } | { rating: number }[] | null
}

export default async function ActivityModalPage({ params }: PageProps) {
  const { activityId } = await params
  const supabase = await createServerSupabaseClient()

  const validId = toValidActivityId(activityId)
  if (!validId) return null

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const { data: activity, error } = await supabase
    .from('activities')
    .select('activity_id, title, description, category, location, event_date, image_url, created_at')
    .eq('activity_id', validId)
    .single()

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('comment_id, comment, created_at, ratings(rating)')
    .eq('activity_id', validId)
    .order('created_at', { ascending: false })

  let existingRating: number | null = null
  if (user && activity) {
    const { data: ratingRow } = await supabase
      .from('ratings')
      .select('rating')
      .eq('activity_id', validId)
      .eq('profile_id', user.id)
      .single()
    existingRating = ratingRow?.rating ?? null
  }

  const fallbackActivity = [...TRENDING, ...OFF_CAMPUS, ...ON_CAMPUS].find((item) => String(item.id) === String(validId))

  if ((error || !activity) && !fallbackActivity) return null

  const pageActivity = activity
    ? {
        title: activity.title,
        category: activity.category,
        location: activity.location,
        avg_rating: null,
        image_url: activity.image_url,
        description: activity.description,
      }
    : {
        title: fallbackActivity!.title,
        category: fallbackActivity!.category,
        location: fallbackActivity!.location,
        avg_rating: fallbackActivity!.rating,
        image_url: fallbackActivity!.imageUrl,
        description: null,
      }

  const initialComments = normalizeActivityComments((comments ?? []) as ActivityComment[])

  return (
    <ActivityDetailOverlay
      activityId={validId}
      pageActivity={pageActivity}
      dbActivity={activity ?? undefined}
      initialComments={initialComments}
      commentsError={Boolean(commentsError)}
      isLoggedIn={isLoggedIn}
      existingRating={existingRating}
    />
  )
}
