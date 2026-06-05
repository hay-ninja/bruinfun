import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getTokenFromRequest, getTokenFromServerCookies, verifySessionToken, type SessionUser } from '@/lib/manual-auth'

// typed auth helper result used by routes
type AuthResult =
  | { user: SessionUser; db: SupabaseClient; error: null }
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

  // authenticated path gets service-role db client
  return { user, db: getAdminSupabase(), error: null }
}
