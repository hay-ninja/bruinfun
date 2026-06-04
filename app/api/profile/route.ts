import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'

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

    return NextResponse.json({ profile, posted, completed: completed ?? [], bookmarks })
}
