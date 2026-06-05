import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { createRating } from '@/lib/db-endpoints/ratings'

export async function POST(req: NextRequest) {
    //auth gate
    const auth = await getRequestUser(req)
    const { user } = auth
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    //parse body & validate
    const body = await req.json()
    const { activity_id, rating } = body

    if (!activity_id || (typeof activity_id !== 'number' && typeof activity_id !== 'string')) {
        return NextResponse.json({ error: 'activity_id is required' }, { status: 400 })
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
        return NextResponse.json({ error: 'rating must be between 1 and 10' }, { status: 400 })
    }

    //insert rating via db-endpoint
    const { data, error } = await createRating(user.id, activity_id, rating)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
