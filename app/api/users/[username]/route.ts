import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

//GET /api/users/[username] - public profile, no bookmarks tab here
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params

    //find the user by username — column is profile_id not id
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_id, username, first_name, last_name')
        .eq('username', username)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    //their posted activities
    const { data: posted, error: postedError } = await supabase
        .from('activities')
        .select('activity_id, title, category, image_url, location, created_at')
        .eq('profile_id', profile.profile_id)
        .order('created_at', { ascending: false })

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }

    //their completed activities
    const { data: completed, error: completedError } = await supabase
        .from('ratings')
        .select('rating_id, rating, created_at, activities(activity_id, title, category, image_url, location)')
        .eq('profile_id', profile.profile_id)
        .order('created_at', { ascending: false })

    if (completedError) {
        return NextResponse.json({ error: completedError.message }, { status: 500 })
    }

    return NextResponse.json({ profile, posted, completed: completed ?? [] })
}
