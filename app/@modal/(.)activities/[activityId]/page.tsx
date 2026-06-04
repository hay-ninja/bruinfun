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

  const { data: activity, error } = await supabase
    .from('activities')
    .select('activity_id, title, description, category, location, event_date, image_url, created_at, avg_rating')
    .eq('activity_id', validId)
    .single()

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('comment_id, comment, created_at, ratings(rating)')
    .eq('activity_id', validId)
    .order('created_at', { ascending: false })

  if (error || !activity) return null

  const pageActivity = {
    title: activity.title,
    category: activity.category,
    location: activity.location,
    avg_rating: activity.avg_rating,
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
    />
  )
}
