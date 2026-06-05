// ratings domain — insert/query ratings rows
import { getAdminSupabase } from '@/lib/supabase/admin'

// insert a rating row for a user + activity
export async function createRating(
  userId: string,
  activityId: number | string,
  rating: number
): Promise<{ data: any; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('ratings')
    .insert({ activity_id: activityId, profile_id: userId, rating })
    .select()
    .single()

  return { data, error }
}
