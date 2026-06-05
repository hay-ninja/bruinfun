import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSessionToken, verifyPassword, AUTH_COOKIE_NAME } from '@/lib/manual-auth'

type LoginBody = {
  email?: string
  password?: string
}

export async function POST(req: Request) {
  const body = (await req.json()) as LoginBody
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email and password are required' },
      { status: 400 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: credential, error } = await adminSupabase
    .from('auth_credentials')
    .select('profile_id, password_hash')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error || !credential) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const isValidPassword = verifyPassword(password, credential.password_hash)

  if (!isValidPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('username')
    .eq('profile_id', credential.profile_id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const token = createSessionToken({
    id: credential.profile_id,
    email: normalizedEmail,
    username: profile?.username ?? null,
  })

  const response = NextResponse.json(
    {
      user: {
        id: credential.profile_id,
        email: normalizedEmail,
        username: profile?.username ?? null,
      },
      message: 'Login successful',
    },
    { status: 200 },
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