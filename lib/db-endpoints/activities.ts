// activities domain — all supabase queries for activities live here
import { getAdminSupabase } from '@/lib/supabase/admin'
import type { DbActivity } from '@/lib/activity-ui'

type ActivityInput = {
  title: string
  description: string
  category: string
  location: string
  event_date?: string | null
  image_url?: string | null
}

// fetch the 60 most recent activities for the homepage
export async function getHomepageActivities(): Promise<DbActivity[]> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('activities')
    .select('activity_id, title, category, location, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(60)

  if (error) console.error('[db] getHomepageActivities error:', error.message)
  return (data ?? []) as DbActivity[]
}

// fetch ratings rows for a set of activity ids
export async function getHomepageRatings(
  activityIds: (string | number)[]
): Promise<{ activity_id: string | number; rating: number }[]> {
  if (activityIds.length === 0) return []
  const db = getAdminSupabase()
  const { data } = await db
    .from('ratings')
    .select('activity_id, rating')
    .in('activity_id', activityIds)
  return (data ?? []) as { activity_id: string | number; rating: number }[]
}

// search/filter activities for the browse api — cursor-based pagination
export async function searchActivities(
  category: string | null,
  search: string | null,
  cursor: string | null
): Promise<{ data: any[]; nextCursor: any; error: any }> {
  const db = getAdminSupabase()
  let query = db
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25)

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    const safeSearch = search.replace(/[%,()]/g, '').trim()
    if (safeSearch) {
      query = query.or(`title.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`)
    }
  }

  if (cursor) {
    query = query.lt('activity_id', cursor)
  }

  const { data, error } = await query

  if (error) return { data: [], nextCursor: null, error }

  const results = data ?? []
  return {
    data: results,
    nextCursor: results.length === 25 ? results[results.length - 1].activity_id : null,
    error: null,
  }
}

// insert a new activity row
export async function createActivity(
  userId: string,
  input: ActivityInput
): Promise<{ data: any; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('activities')
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      event_date: input.event_date ?? null,
      image_url: input.image_url ?? null,
      profile_id: userId,
    })
    .select()
    .single()

  return { data, error }
}

// fetch all rating rows for a single activity (used for attendee count + avg in modal)
export async function getActivityRatings(
  activityId: string
): Promise<{ rating: number }[]> {
  const db = getAdminSupabase()
  const { data } = await db
    .from('ratings')
    .select('rating')
    .eq('activity_id', activityId)
  return (data ?? []) as { rating: number }[]
}

// fetch a single activity with its comments + avg rating
export async function getActivityById(
  activityId: string,
  userId?: string | null
): Promise<{
  activity: any
  comments: any[]
  averageRating: number | null
  existingRating: number | null
  error: boolean
}> {
  const db = getAdminSupabase()

  const [{ data: activity, error }, { data: comments }, { data: avgResult }] = await Promise.all([
    db
      .from('activities')
      .select('activity_id, title, description, category, location, event_date, image_url, created_at')
      .eq('activity_id', activityId)
      .single(),
    db
      .from('comments')
      .select('comment_id, comment, created_at, ratings(rating)')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false }),
    db.from('ratings').select('rating.avg()').eq('activity_id', activityId).single(),
  ])

  let existingRating: number | null = null
  if (userId) {
    const { data: ratingRow } = await db
      .from('ratings')
      .select('rating')
      .eq('activity_id', activityId)
      .eq('profile_id', userId)
      .single()
    existingRating = ratingRow?.rating ?? null
  }

  const averageRating = avgResult?.avg != null ? Number(Number(avgResult.avg).toFixed(1)) : null

  return {
    activity: activity ?? null,
    comments: (comments ?? []) as any[],
    averageRating,
    existingRating,
    error: !!error || !activity,
  }
}
