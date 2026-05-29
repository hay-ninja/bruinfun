import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'

// GET /api/profile - returns everything needed for the own profile page
export async function GET(req: NextRequest) {
    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const { user, db } = auth

    // grab profile info (username, name etc)
    const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('username, first_name, last_name')
        .eq('id', user.id)
        .single()

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // activities this user posted
    const { data: posted, error: postedError } = await db
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }

    // activities this user rated (completed), joined with activity details
    // note: ratings table is being added by kai/kaveh — falls back to [] if not ready yet
    const { data: completed, error: completedError } = await db
        .from('ratings')
        .select('rating, comment, created_at, activities(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // bookmarked activities joined with activity details
    // order by activity_id since created_at may not exist on bookmarks table
    const { data: bookmarks, error: bookmarksError } = await db
        .from('bookmarks')
        .select('activity_id, activities(*)')
        .eq('user_id', user.id)
        .order('activity_id', { ascending: false })

    if (bookmarksError) {
        return NextResponse.json({ error: bookmarksError.message }, { status: 500 })
    }

    // return completed as [] if ratings table isn't ready yet (kaveh's branch)
    return NextResponse.json({ profile, posted, completed: completed ?? [], bookmarks })
}
