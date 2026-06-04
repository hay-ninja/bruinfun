import HomeClient from '@/components/home-client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mapDbActivityToCard, splitHomepageActivities, type Activity, type DbActivity } from '@/lib/activity-ui'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('activities')
    .select('activity_id, title, category, location, image_url, avg_rating')
    .order('created_at', { ascending: false })
    .limit(60)

  const activities = ((data ?? []) as DbActivity[])
    .map(mapDbActivityToCard)
    .filter((activity): activity is Activity => activity !== null)

  const sections = splitHomepageActivities(activities)

  return <HomeClient {...sections} />
}
