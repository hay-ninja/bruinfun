import { NextRequest, NextResponse } from 'next/server'
import { getPublicProfile, getPostedActivitiesForUser, getCompletedActivitiesForUser } from '@/lib/db-endpoints/users'

//GET /api/users/[username] - public profile, no bookmarks tab here
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params

    //find the user by username — column is profile_id not id
    const { data: profile, error: profileError } = await getPublicProfile(username)

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    //their posted + completed activities in parallel
    const [
        { data: posted, error: postedError },
        { data: completed, error: completedError },
    ] = await Promise.all([
        getPostedActivitiesForUser(profile.profile_id),
        getCompletedActivitiesForUser(profile.profile_id),
    ])

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }
    if (completedError) {
        return NextResponse.json({ error: completedError.message }, { status: 500 })
    }

    return NextResponse.json({ profile, posted, completed: completed ?? [] })
}
