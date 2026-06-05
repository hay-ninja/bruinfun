// bookmarks domain — get/add/remove bookmarks for a user
import { getAdminSupabase } from '@/lib/supabase/admin'

// get all bookmarked activity ids for a user
export async function getUserBookmarks(userId: string): Promise<{ data: string[]; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('bookmarks')
    .select('activity_id')
    .eq('profile_id', userId)

  const ids = (data ?? []).map((b: any) => String(b.activity_id))
  return { data: ids, error }
}

// insert a bookmark row
export async function addBookmark(
  userId: string,
  activityId: number | string
): Promise<{ data: any; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('bookmarks')
    .insert({ profile_id: userId, activity_id: activityId })
    .select()
    .single()

  return { data, error }
}

// delete a bookmark row
export async function removeBookmark(
  userId: string,
  activityId: number | string
): Promise<{ error: any }> {
  const db = getAdminSupabase()
  const { error } = await db
    .from('bookmarks')
    .delete()
    .eq('profile_id', userId)
    .eq('activity_id', activityId)

  return { error }
}
