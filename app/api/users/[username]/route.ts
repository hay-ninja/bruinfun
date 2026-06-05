import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildAvgRatings } from '@/lib/activity-ui'

// GET /api/users/[username] - public profile, no bookmarks tab here
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params

    // find the user by username — column is profile_id not id
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_id, username, first_name, last_name')
        .eq('username', username)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // their posted activities
    const { data: posted, error: postedError } = await supabase
        .from('activities')
        .select('activity_id, title, category, image_url, location, created_at')
        .eq('profile_id', profile.profile_id)
        .order('created_at', { ascending: false })

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }

    const postedIds = (posted ?? []).map((a) => a.activity_id)
    const { data: postedRatings } = postedIds.length > 0
        ? await supabase.from('ratings').select('activity_id, rating').in('activity_id', postedIds)
        : { data: [] }

    const avgRatings = buildAvgRatings((postedRatings ?? []) as { activity_id: string | number; rating: number }[])
    const postedWithRatings = (posted ?? []).map((a) => ({
        ...a,
        avg_rating: avgRatings.get(String(a.activity_id)) ?? 0,
    }))

    // their completed activities
    const { data: completed, error: completedError } = await supabase
        .from('ratings')
        .select('rating_id, rating, created_at, activities(activity_id, title, category, image_url, location)')
        .eq('profile_id', profile.profile_id)
        .order('created_at', { ascending: false })

    if (completedError) {
        return NextResponse.json({ error: completedError.message }, { status: 500 })
    }

    return NextResponse.json({ profile, posted: postedWithRatings, completed: completed ?? [] })
}
