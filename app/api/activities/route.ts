import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const VALID_CATEGORIES = ['sports', 'food', 'arts', 'nightlife', 'outdoors']

//create new activity func
export async function POST(req: NextRequest) {

    //checking auth 
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: {user}, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    //parsing the body of request & validating - only require title for creating activity
    const body = await req.json()
    const { title, category, image_url } = body

    if (!title || typeof title !== 'string') {
        return NextResponse.json({ error: 'title is required'}, {status: 400})
    }
    if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
    }

    // insert into supabase
    const { data, error } = await supabase
        .from('activities')
        .insert({ title, category, image_url: image_url ?? null, user_id: user.id })
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
    const sort = searchParams.get('sort')
    const cursor = searchParams.get('cursor') // not pages, cursor = ID of last loaded activity to support infinite scrolling like pinterest :D

    let query = supabase
    .from('activities')
    .select('*')
    .order('created_at', {ascending: false})
    .limit(25)

    if (category) {
        query = query.eq('category', category)
    }

    if (sort === 'rating') {
        query = query.order('avg_rating', {ascending: false})
    }
    if (cursor) {
        query = query.lt('id', cursor)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, {status: 500})
    }

    return NextResponse.json({
        data,
        nextCursor: data.length === 25 ? data[data.length - 1].id : null
    })
}