import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// save an activity to bookmarks
export async function POST(req: NextRequest) {

    // check auth
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { activity_id } = body

    if (!activity_id || typeof activity_id !== 'number') {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, activity_id })
        .select()
        .single()

    if (error) {
        // already bookmarked (unique constraint)
        if (error.code === '23505') {
            return NextResponse.json({ error: 'already bookmarked' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}

// remove a bookmark
export async function DELETE(req: NextRequest) {

    // check auth
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { activity_id } = body

    if (!activity_id || typeof activity_id !== 'number') {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }

    // delete matching row for this user + activity
    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('activity_id', activity_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'bookmark removed' }, { status: 200 })
}
