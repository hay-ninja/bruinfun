import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import {
  getProfileById,
  getPostedActivities,
  getCompletedActivities,
  getBookmarkedActivities,
  getRatingsForActivities,
} from '@/lib/db-endpoints/profile'

//GET /api/profile - returns everything needed for the own profile page
export async function GET(req: NextRequest) {
    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const { user } = auth

    //grab profile info — column is profile_id not id
    const { data: profile, error: profileError } = await getProfileById(user.id)

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    //fetch posted, completed, bookmarked in parallel
    const [
        { data: posted, error: postedError },
        { data: completed, error: completedError },
        { data: bookmarks, error: bookmarksError },
    ] = await Promise.all([
        getPostedActivities(user.id),
        getCompletedActivities(user.id),
        getBookmarkedActivities(user.id),
    ])

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }
    if (completedError) {
        return NextResponse.json({ error: completedError.message }, { status: 500 })
    }
    if (bookmarksError) {
        return NextResponse.json({ error: bookmarksError.message }, { status: 500 })
    }

    //compute the average rating per activity (same approach as the homepage)
    //gather every activity_id shown across the posted + bookmark tabs
    const postedList = (posted ?? []) as any[]
    const bookmarkList = (bookmarks ?? []) as any[]
    const completedList = (completed ?? []) as any[]

    const allIds = [
        ...postedList.map((a) => a.activity_id),
        ...bookmarkList.map((b) => b.activities?.activity_id).filter(Boolean),
        ...completedList.map((c) => c.activities?.activity_id).filter(Boolean),
    ]

    const { data: allRatings } = await getRatingsForActivities(allIds)

    const avgById = new Map<string, number>()
    const totals = new Map<string, { total: number; count: number }>()
    for (const r of allRatings) {
        const key = String(r.activity_id)
        const cur = totals.get(key) ?? { total: 0, count: 0 }
        cur.total += Number(r.rating ?? 0)
        cur.count += 1
        totals.set(key, cur)
    }
    for (const [key, { total, count }] of totals) {
        avgById.set(key, count > 0 ? Number((total / count).toFixed(1)) : 0)
    }

    //stamp avg_rating onto posted activities
    const postedWithAvg = postedList.map((a) => ({
        ...a,
        avg_rating: avgById.get(String(a.activity_id)) ?? 0,
    }))

    //stamp avg_rating onto the joined activity inside each bookmark
    const bookmarksWithAvg = bookmarkList.map((b) => ({
        ...b,
        activities: b.activities
            ? { ...b.activities, avg_rating: avgById.get(String(b.activities.activity_id)) ?? 0 }
            : b.activities,
    }))

    //stamp avg_rating onto the joined activity inside each completed entry
    const completedWithAvg = completedList.map((c) => ({
        ...c,
        activities: c.activities
            ? { ...c.activities, avg_rating: avgById.get(String(c.activities.activity_id)) ?? 0 }
            : c.activities,
    }))

    return NextResponse.json({
        profile,
        posted: postedWithAvg,
        completed: completedWithAvg,
        bookmarks: bookmarksWithAvg,
    })
}
