import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/users/[username] - public profile, no bookmarks tab here
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params

    // find the user by username first
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name')
        .eq('username', username)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // their posted activities
    const { data: posted, error: postedError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

    if (postedError) {
        return NextResponse.json({ error: postedError.message }, { status: 500 })
    }

    // their completed activities (ratings + activity details)
    const { data: completed, error: completedError } = await supabase
        .from('ratings')
        .select('rating, comment, created_at, activities(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

    if (completedError) {
        return NextResponse.json({ error: completedError.message }, { status: 500 })
    }

    return NextResponse.json({ profile, posted, completed: completed ?? [] })
}
