import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { buildAvgRatings } from '@/lib/activity-ui'

// GET /api/profile - returns everything needed for the own profile page
export async function GET(req: NextRequest) {
    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const { user, db } = auth

    // grab profile info — column is profile_id not id
    const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('username, first_name, last_name')
        .eq('profile_id', user.id)
        .single()

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // activities this user posted — user FK is profile_id not user_id
    const { data: posted, error: postedError } = await db
        .from('activities')
        .select('activity_id, title, category, image_url, location, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }

    // activities this user rated, joined with activity details
    const { data: completed, error: completedError } = await db
        .from('ratings')
        .select('rating_id, rating, created_at, activities(activity_id, title, category, image_url, location)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })

    if (completedError) {
        return NextResponse.json({ error: completedError.message }, { status: 500 })
    }

    // bookmarked activities, joined with activity details
    const { data: bookmarks, error: bookmarksError } = await db
        .from('bookmarks')
        .select('activity_id, activities(activity_id, title, category, image_url, location)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })

    if (bookmarksError) {
        return NextResponse.json({ error: bookmarksError.message }, { status: 500 })
    }

    // collect all activity IDs across all three tabs for a single ratings fetch
    const postedIds = (posted ?? []).map((a) => a.activity_id)
    const completedIds = (completed ?? []).flatMap((e) => {
        const a = e.activities
        if (!a) return []
        return Array.isArray(a) ? a.map((x) => x.activity_id) : [a.activity_id]
    })
    const bookmarkIds = (bookmarks ?? []).flatMap((b) => {
        const a = b.activities
        if (!a) return []
        return Array.isArray(a) ? a.map((x) => x.activity_id) : [a.activity_id]
    })
    const allIds = [...new Set([...postedIds, ...completedIds, ...bookmarkIds])]

    const { data: ratingsData } = allIds.length > 0
        ? await db.from('ratings').select('activity_id, rating').in('activity_id', allIds)
        : { data: [] }

    const avgRatings = buildAvgRatings((ratingsData ?? []) as { activity_id: string | number; rating: number }[])
    const withAvg = (a: { activity_id: number | string; [key: string]: unknown }) => ({
        ...a,
        avg_rating: avgRatings.get(String(a.activity_id)) ?? 0,
    })

    const postedWithRatings = (posted ?? []).map(withAvg)
    const completedWithRatings = (completed ?? []).map((e) => ({
        ...e,
        activities: e.activities
            ? Array.isArray(e.activities)
                ? e.activities.map(withAvg)
                : withAvg(e.activities)
            : null,
    }))
    const bookmarksWithRatings = (bookmarks ?? []).map((b) => ({
        ...b,
        activities: b.activities
            ? Array.isArray(b.activities)
                ? b.activities.map(withAvg)
                : withAvg(b.activities)
            : null,
    }))

    return NextResponse.json({ profile, posted: postedWithRatings, completed: completedWithRatings, bookmarks: bookmarksWithRatings })
}
