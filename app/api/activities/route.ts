import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getRequestUser } from '@/lib/auth'

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

    // insert into supabase
    const { data, error } = await auth.db
        .from('activities')
        .insert({
            title,
            description,
            category,
            location,
            event_date: event_date || null,
            image_url: image_url || null,
            profile_id: user.id,
        })
        .select()
        .single()

    if (error){
        return NextResponse.json( { error: error.message }, { status: 500 })
    }
    // return succesful object!
    return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const cursor = searchParams.get('cursor') // not pages, cursor = ID of last loaded activity to support infinite scrolling like pinterest :D

    let query = supabase
    .from('activities')
    .select('*')
    .order(sort === 'rating' ? 'avg_rating' : 'created_at', {ascending: false})
    .limit(25)

    if (category) {
        query = query.eq('category', category)
    }

    if (search) {
        const safeSearch = search.replace(/[%,()]/g, '').trim()
        if (safeSearch) {
            query = query.or(`title.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`)
        }
    }

    if (cursor) {
        query = query.lt('activity_id', cursor)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, {status: 500})
    }

    return NextResponse.json({
        data,
        nextCursor: data.length === 25 ? data[data.length - 1].activity_id : null
    })
}
