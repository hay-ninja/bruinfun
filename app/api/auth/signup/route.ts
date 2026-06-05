import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { createSessionToken, hashPassword, AUTH_COOKIE_NAME } from '@/lib/manual-auth'

type SignupBody = {
  email?: string
  password?: string
  username?: string
  first_name?: string
  last_name?: string
}

//signup flow: create profile+creds, then auto-login cookie
export async function POST(req: Request) {
  //read body + required fields gate
  const body = (await req.json()) as SignupBody
  const { email, password, username, first_name, last_name } = body

  if (!email || !password || !username || !first_name || !last_name) {
    return NextResponse.json(
      {
        error:
          'email, password, username, first_name, and last_name are required',
      },
      { status: 400 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()
  const adminSupabase = getAdminSupabase()

  //email already used?
  const { data: emailExisting } = await adminSupabase
    .from('auth_credentials')
    .select('profile_id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (emailExisting) {
    return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
  }

  //username already taken?
  const { data: usernameExisting } = await adminSupabase
    .from('profiles')
    .select('profile_id')
    .eq('username', normalizedUsername)
    .maybeSingle()

  if (usernameExisting) {
    return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
  }

  //step 1: make profile row
  const profileId = randomUUID()
  const passwordHash = hashPassword(password)

  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      profile_id: profileId,
      username: normalizedUsername,
      first_name,
      last_name,
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  //step 2: add auth_credentials row
  const { error: credentialsError } = await adminSupabase
    .from('auth_credentials')
    .insert({
      profile_id: profileId,
      email: normalizedEmail,
      password_hash: passwordHash,
    })

  if (credentialsError) {
    //credentials failed, roll back profile insert
    await adminSupabase.from('profiles').delete().eq('profile_id', profileId)
    return NextResponse.json({ error: credentialsError.message }, { status: 400 })
  }

  //done: sign token + set cookie
  const token = createSessionToken({
    id: profileId,
    email: normalizedEmail,
    username: normalizedUsername,
  })

  const response = NextResponse.json(
    {
      user: {
        id: profileId,
        email: normalizedEmail,
        username: normalizedUsername,
      },
      message: 'Signup successful',
    },
    { status: 201 },
  )

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}