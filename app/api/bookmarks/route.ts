import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'

// save an activity to bookmarks
export async function POST(req: NextRequest) {

    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const { user } = auth

    const body = await req.json()
    const { activity_id } = body

    if (!activity_id || (typeof activity_id !== 'number' && typeof activity_id !== 'string')) {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }

    const { data, error } = await auth.db
        .from('bookmarks')
        .insert({ profile_id: user.id, activity_id })
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

    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const { user } = auth

    const body = await req.json()
    const { activity_id } = body

    if (!activity_id || (typeof activity_id !== 'number' && typeof activity_id !== 'string')) {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }

    // delete matching row for this user + activity
    const { error } = await auth.db
        .from('bookmarks')
        .delete()
        .eq('profile_id', user.id)
        .eq('activity_id', activity_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'bookmark removed' }, { status: 200 })
}
