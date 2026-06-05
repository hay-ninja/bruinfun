import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { createActivity, searchActivities } from '@/lib/db-endpoints/activities'

const VALID_CATEGORIES = ['sports', 'food', 'arts', 'nightlife', 'outdoors']

//create new activity func
export async function POST(req: NextRequest) {

    //checking auth
    const auth = await getRequestUser(req)
    const { user } = auth
    if (!user) {
        return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 })
    }

    //parsing the body of request & validating
    const body = await req.json()
    const { title, description, category, location, event_date, image_url } = body

    if (!title || typeof title !== 'string') {
        return NextResponse.json({ error: 'title is required'}, {status: 400})
    }
    if (!description || typeof description !== 'string') {
        return NextResponse.json({ error: 'description is required'}, {status: 400})
    }
    if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
    }
    if (!location || typeof location !== 'string') {
        return NextResponse.json({ error: 'location is required'}, {status: 400})
    }

    //insert via db-endpoint
    const { data, error } = await createActivity(user.id, {
        title,
        description,
        category,
        location,
        event_date: event_date || null,
        image_url: image_url || null,
    })

    if (error){
        return NextResponse.json( { error: error.message }, { status: 500 })
    }
    //return succesful object!
    return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const cursor = searchParams.get('cursor') //not pages, cursor = ID of last loaded activity to support infinite scrolling like pinterest :D

    const { data, nextCursor, error } = await searchActivities(category, search, cursor)

    if (error) {
        return NextResponse.json({ error: error.message }, {status: 500})
    }

    return NextResponse.json({ data, nextCursor })
}
