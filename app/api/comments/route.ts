import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
    const auth = await getRequestUser(req)
    const { user } = auth
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const { data, error } = await auth.db
        .from('comments')
        .insert({
            activity_id,
            rating_id,
            profile_id: user.id,
            comment,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
