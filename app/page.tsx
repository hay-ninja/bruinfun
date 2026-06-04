import HomeClient from '@/components/home-client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mapDbActivityToCard, splitHomepageActivities, type Activity, type DbActivity } from '@/lib/activity-ui'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('activities')
    .select('activity_id, title, category, location, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(60)

  const activityIds = ((data ?? []) as DbActivity[]).map((activity) => activity.activity_id)
  const { data: ratings } = activityIds.length > 0
    ? await supabase
        .from('ratings')
        .select('activity_id, rating')
        .in('activity_id', activityIds)
    : { data: [] }

  const ratingTotals = new Map<string, { total: number; count: number }>()
  for (const rating of (ratings ?? []) as { activity_id: string | number; rating: number }[]) {
    const key = String(rating.activity_id)
    const current = ratingTotals.get(key) ?? { total: 0, count: 0 }
    current.total += Number(rating.rating ?? 0)
    current.count += 1
    ratingTotals.set(key, current)
  }

  const activities = ((data ?? []) as DbActivity[])
    .map((activity) => {
      const rating = ratingTotals.get(String(activity.activity_id))
      return {
        ...activity,
        avg_rating: rating && rating.count > 0 ? Number((rating.total / rating.count).toFixed(1)) : 0,
      }
    })
    .map(mapDbActivityToCard)
    .filter((activity): activity is Activity => activity !== null)

  const sections = splitHomepageActivities(activities)

  return <HomeClient {...sections} />
}
