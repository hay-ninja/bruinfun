// comments domain — insert comment rows tied to a rating + activity
import { getAdminSupabase } from '@/lib/supabase/admin'

// persist a comment linked to a rating
export async function createComment(
  userId: string,
  activityId: number | string,
  ratingId: number | string,
  comment: string
): Promise<{ data: any; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('comments')
    .insert({ activity_id: activityId, rating_id: ratingId, profile_id: userId, comment })
    .select()
    .single()

  return { data, error }
}
