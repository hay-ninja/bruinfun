import { NextResponse } from 'next/server'
import { createSessionToken, verifyPassword, AUTH_COOKIE_NAME } from '@/lib/manual-auth'
import { findCredentialByEmail, findProfileById } from '@/lib/db-endpoints/auth'

type LoginBody = {
  email?: string
  password?: string
}

//login flow: check creds, mint cookie, return user blob
export async function POST(req: Request) {
  //grab payload + fast required-field check
  const body = (await req.json()) as LoginBody
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email and password are required' },
      { status: 400 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  //lookup credential by normalized email
  const { data: credential, error } = await findCredentialByEmail(normalizedEmail)

  if (error || !credential) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  //wrong pass? bail w/ same 401 msg
  const isValidPassword = verifyPassword(password, credential.password_hash)

  if (!isValidPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  //pull username so client has it right away
  const { data: profile, error: profileError } = await findProfileById(credential.profile_id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  //sign session token + set cookie
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
