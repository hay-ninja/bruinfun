import HomeClient from '@/components/home-client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mapDbActivityToCard, splitHomepageActivities, type Activity, type DbActivity } from '@/lib/activity-ui'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createServerSupabaseClient()

  const [{ data, error }, { data: { user } }] = await Promise.all([
    supabase
      .from('activities')
      .select('activity_id, title, category, location, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(60),
    supabase.auth.getUser(),
  ])

  if (error) console.error('[homepage] activities fetch error:', error.message)

  const activityIds = ((data ?? []) as DbActivity[]).map((a) => a.activity_id)

  const [{ data: ratings }, { data: bookmarkData }] = await Promise.all([
    activityIds.length > 0
      ? supabase
          .from('ratings')
          .select('activity_id, rating')
          .in('activity_id', activityIds)
      : Promise.resolve({ data: [] }),
    user
      ? supabase
          .from('bookmarks')
          .select('activity_id')
          .eq('profile_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const bookmarkedIds = new Set(
    ((bookmarkData ?? []) as { activity_id: string | number }[]).map((b) => String(b.activity_id))
  )

  const ratingTotals = new Map<string, { total: number; count: number }>()
  for (const r of (ratings ?? []) as { activity_id: string | number; rating: number }[]) {
    const key = String(r.activity_id)
    const current = ratingTotals.get(key) ?? { total: 0, count: 0 }
    current.total += Number(r.rating ?? 0)
    current.count += 1
    ratingTotals.set(key, current)
  }

  const activities = ((data ?? []) as DbActivity[])
    .map((activity) => {
      const r = ratingTotals.get(String(activity.activity_id))
      return {
        ...activity,
        avg_rating: r && r.count > 0 ? Number((r.total / r.count).toFixed(1)) : 0,
      }
    })
    .map(mapDbActivityToCard)
    .filter((activity): activity is Activity => activity !== null)
    .map((activity) => ({ ...activity, isBookmarked: bookmarkedIds.has(activity.id) }))

  const sections = splitHomepageActivities(activities)

  return <HomeClient {...sections} />
}
