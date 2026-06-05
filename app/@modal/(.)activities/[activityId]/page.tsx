import { createServerSupabaseClient } from '@/lib/supabase/server'
import ActivityDetailOverlay from '@/components/activity/ActivityDetailOverlay'
import { toValidActivityId, normalizeActivityComments } from '@/app/activities/[activityId]/page'

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

  const [
    { data: activity, error },
    { data: comments, error: commentsError },
    { data: ratingsData },
    { data: bookmarkData },
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
      .select('rating')
      .eq('activity_id', validId),
    user
      ? supabase
          .from('bookmarks')
          .select('activity_id')
          .eq('profile_id', user.id)
          .eq('activity_id', validId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (error || !activity) return null

  const ratings = (ratingsData ?? []) as { rating: number }[]
  const attendeeCount = ratings.length > 0 ? ratings.length : undefined
  const averageRating = ratings.length > 0
    ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
    : null

  const pageActivity = {
    title: activity.title,
    category: activity.category,
    location: activity.location,
    avg_rating: averageRating,
    image_url: activity.image_url,
    description: activity.description,
  }

  const initialComments = normalizeActivityComments((comments ?? []) as ActivityComment[])

  return (
    <ActivityDetailOverlay
      activityId={validId}
      pageActivity={pageActivity}
      initialComments={initialComments}
      commentsError={Boolean(commentsError)}
      attendeeCount={attendeeCount}
      isBookmarked={Boolean(bookmarkData)}
      isLoggedIn={Boolean(user)}
    />
  )
}
