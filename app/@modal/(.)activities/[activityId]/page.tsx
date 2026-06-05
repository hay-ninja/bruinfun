import ActivityDetailOverlay from '@/components/activity/ActivityDetailOverlay'
import { toValidActivityId, normalizeActivityComments } from '@/app/activities/[activityId]/page'
import { getRequestUser } from '@/lib/auth'
import { getActivityById, getActivityRatings } from '@/lib/db-endpoints/activities'
import { isActivityBookmarked } from '@/lib/db-endpoints/bookmarks'

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
  const auth = await getRequestUser()
  const user = auth.user

  const validId = toValidActivityId(activityId)
  if (!validId) return null

  const [{ activity, comments, error }, ratingsData, bookmarked] = await Promise.all([
    getActivityById(validId, user?.id ?? null),
    getActivityRatings(validId),
    user ? isActivityBookmarked(user.id, validId) : Promise.resolve(false),
  ])

  if (error || !activity) return null

  const attendeeCount = ratingsData.length > 0 ? ratingsData.length : undefined
  const averageRating = ratingsData.length > 0
    ? Number((ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length).toFixed(1))
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
      commentsError={false}
      attendeeCount={attendeeCount}
      isBookmarked={bookmarked}
      isLoggedIn={Boolean(user)}
    />
  )
}
