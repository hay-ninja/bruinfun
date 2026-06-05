// users domain — public profile data, no auth required
import { getAdminSupabase } from '@/lib/supabase/admin'

// find a user by username for the public profile page
export async function getPublicProfile(
  username: string
): Promise<{ data: { profile_id: string; username: string; first_name: string; last_name: string } | null; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('profiles')
    .select('profile_id, username, first_name, last_name')
    .eq('username', username)
    .single()

  return { data, error }
}

// activities posted by a user
export async function getPostedActivitiesForUser(
  profileId: string
): Promise<{ data: any[]; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('activities')
    .select('activity_id, title, category, image_url, location, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

// activities a user completed (rated)
export async function getCompletedActivitiesForUser(
  profileId: string
): Promise<{ data: any[]; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('ratings')
    .select('rating_id, rating, created_at, activities(activity_id, title, category, image_url, location)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}
