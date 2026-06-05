import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { createComment } from '@/lib/db-endpoints/comments'

//create comment row tied to rating + activity
export async function POST(req: NextRequest) {
    // auth gate
    const auth = await getRequestUser(req)
    const { user } = auth
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    //payload + input checks
    const body = await req.json()
    const { activity_id, rating_id, comment } = body

    if (!activity_id || (typeof activity_id !== 'number' && typeof activity_id !== 'string')) {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }
    if (!rating_id || (typeof rating_id !== 'number' && typeof rating_id !== 'string')) {
        return NextResponse.json({ error: 'rating_id is required' }, { status: 400 })
    }
    if (!comment || typeof comment !== 'string') {
        return NextResponse.json({ error: 'comment is required' }, { status: 400 })
    }

    //persist comment via db-endpoint
    const { data, error } = await createComment(user.id, activity_id, rating_id, comment)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
