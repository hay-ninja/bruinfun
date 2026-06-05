import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, createSessionToken, verifySessionToken } from '@/lib/manual-auth'

const REFRESH_WINDOW_SECONDS = 60 * 60 * 24 //refresh when less than 1 day remaining

//refresh session cookie if token is nearing expiration
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return response

  const user = verifySessionToken(token)
  if (!user) return response

  //re-read exp from payload so we know when to refresh
  try {
    const [payloadPart] = token.split('.')
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as { exp: number }
    const secondsRemaining = payload.exp - Math.floor(Date.now() / 1000)

    if (secondsRemaining < REFRESH_WINDOW_SECONDS) {
      const refreshedToken = createSessionToken(user)
      response.cookies.set(AUTH_COOKIE_NAME, refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }
  } catch {
    //bad payload, skip refresh quietly
  }

  return response
}
