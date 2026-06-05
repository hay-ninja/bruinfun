import type { NextRequest } from 'next/server'
import { getTokenFromRequest, getTokenFromServerCookies, verifySessionToken, type SessionUser } from '@/lib/manual-auth'

// typed auth helper result used by routes
type AuthResult =
  | { user: SessionUser; error: null }
  | { user: null; error: string }

// resolve user from bearer/cookie token
export async function getRequestUser(req?: NextRequest | Request): Promise<AuthResult> {
  const token = getTokenFromRequest(req) || (!req ? await getTokenFromServerCookies() : null)

  if (!token) {
    return { user: null, error: 'Unauthorized' }
  }

  const user = verifySessionToken(token)

  if (!user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}
