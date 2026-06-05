import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { getUserBookmarks, addBookmark, removeBookmark } from '@/lib/db-endpoints/bookmarks'

//get all bookmarked activity IDs for the current user
export async function GET(req: NextRequest) {
    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { data, error } = await getUserBookmarks(auth.user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookmarkedIds: data })
}

//save an activity to bookmarks
export async function POST(req: NextRequest) {

    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await req.json()
    const { activity_id } = body

    if (!activity_id || (typeof activity_id !== 'number' && typeof activity_id !== 'string')) {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }

    const { data, error } = await addBookmark(auth.user.id, activity_id)

    if (error) {
        //already bookmarked (unique constraint)
        if (error.code === '23505') {
            return NextResponse.json({ error: 'already bookmarked' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}

//remove a bookmark
export async function DELETE(req: NextRequest) {

    const auth = await getRequestUser(req)
    if (auth.user === null) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await req.json()
    const { activity_id } = body

    if (!activity_id || (typeof activity_id !== 'number' && typeof activity_id !== 'string')) {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }

    //delete matching row for this user + activity
    const { error } = await removeBookmark(auth.user.id, activity_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'bookmark removed' }, { status: 200 })
}
