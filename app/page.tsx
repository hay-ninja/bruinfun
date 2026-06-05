import HomeClient from '@/components/home-client'
import { mapDbActivityToCard, splitHomepageActivities, type Activity } from '@/lib/activity-ui'
import { getRequestUser } from '@/lib/auth'
import { getHomepageActivities, getHomepageRatings } from '@/lib/db-endpoints/activities'
import { getUserBookmarks } from '@/lib/db-endpoints/bookmarks'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const auth = await getRequestUser()
  const userId = auth.user?.id ?? null

  //fetch the most recent 60 activities for the homepage
  const rawActivities = await getHomepageActivities()
  const activityIds = rawActivities.map((a) => a.activity_id)

  //fetch ratings + bookmarks in parallel — bookmarks only if logged in
  const [ratings, bookmarkIds] = await Promise.all([
    getHomepageRatings(activityIds),
    userId ? getUserBookmarks(userId).then((r) => r.data) : Promise.resolve([] as string[]),
  ])

  const bookmarkedIds = new Set(bookmarkIds)

  //compute avg rating per activity from raw rating rows
  const ratingTotals = new Map<string, { total: number; count: number }>()
  for (const r of ratings) {
    const key = String(r.activity_id)
    const current = ratingTotals.get(key) ?? { total: 0, count: 0 }
    current.total += Number(r.rating ?? 0)
    current.count += 1
    ratingTotals.set(key, current)
  }

  //stamp avg_rating + isBookmarked onto each activity card
  const activities = rawActivities
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
