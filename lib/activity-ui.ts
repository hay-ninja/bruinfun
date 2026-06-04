export type ActivityCategory = 'sports' | 'food' | 'arts' | 'nightlife' | 'outdoors'

export type Activity = {
  id: number
  title: string
  rating: number
  location: string
  imageUrl: string | null
  href: string
  category: ActivityCategory | null
  attendeeCount?: number
  tags: string[]
  isBookmarked?: boolean
}

export type DbActivity = {
  activity_id: number | string
  title: string | null
  category: string | null
  location: string | null
  image_url: string | null
  avg_rating: number | null
}

const campusLocationPattern = /ucla|ackerman|powell|janss|royce|bruin|de neve|sunset|westwood|wooden|kerckhoff|schoenberg|anderson|boelter/i

export function toActivityCategory(category: string | null | undefined): ActivityCategory | null {
  if (
    category === 'sports' ||
    category === 'food' ||
    category === 'arts' ||
    category === 'nightlife' ||
    category === 'outdoors'
  ) {
    return category
  }

  return null
}

export function categoryLabel(category: ActivityCategory | null | undefined) {
  if (!category) return 'Activity'
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function mapDbActivityToCard(activity: DbActivity): Activity | null {
  const id = Number(activity.activity_id)
  if (!Number.isInteger(id) || id <= 0 || !activity.title) {
    return null
  }

  return {
    id,
    title: activity.title,
    rating: Number(activity.avg_rating ?? 0),
    location: activity.location ?? 'Location unavailable',
    imageUrl: activity.image_url,
    href: `/activities/${id}`,
    category: toActivityCategory(activity.category),
    tags: [],
  }
}

export function splitHomepageActivities(activities: Activity[]) {
  const byRating = [...activities].sort((left, right) => right.rating - left.rating)
  const trending = byRating.slice(0, 8)
  const onCampus = activities.filter((activity) => campusLocationPattern.test(activity.location)).slice(0, 8)
  const offCampus = activities.filter((activity) => !campusLocationPattern.test(activity.location)).slice(0, 8)

  return {
    trending: trending.length > 0 ? trending : activities.slice(0, 8),
    offCampus,
    onCampus,
    all: activities,
  }
}
