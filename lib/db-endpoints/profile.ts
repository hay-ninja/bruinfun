// profile domain — data for the authenticated user's own profile page
import { getAdminSupabase } from '@/lib/supabase/admin'

// get basic profile info for the logged-in user
export async function getProfileById(
  userId: string
): Promise<{ data: { username: string; first_name: string; last_name: string } | null; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('profiles')
    .select('username, first_name, last_name')
    .eq('profile_id', userId)
    .single()

  return { data, error }
}

// activities posted by this user
export async function getPostedActivities(userId: string): Promise<{ data: any[]; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('activities')
    .select('activity_id, title, category, image_url, location, created_at')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

// activities this user rated (completed), joined with activity details
export async function getCompletedActivities(userId: string): Promise<{ data: any[]; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('ratings')
    .select('rating_id, rating, created_at, activities(activity_id, title, category, image_url, location)')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

// bookmarked activities, joined with activity details
export async function getBookmarkedActivities(userId: string): Promise<{ data: any[]; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('bookmarks')
    .select('activity_id, activities(activity_id, title, category, image_url, location)')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

// fetch all rating rows for a set of activity ids (used to compute avg_rating)
export async function getRatingsForActivities(
  activityIds: (string | number)[]
): Promise<{ data: { activity_id: string | number; rating: number }[] }> {
  if (activityIds.length === 0) return { data: [] }
  const db = getAdminSupabase()
  const { data } = await db
    .from('ratings')
    .select('activity_id, rating')
    .in('activity_id', activityIds)

  return { data: (data ?? []) as { activity_id: string | number; rating: number }[] }
}
