import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getTokenFromRequest, getTokenFromServerCookies, verifySessionToken, type SessionUser } from '@/lib/manual-auth'

type AuthResult =
  | { user: SessionUser; db: SupabaseClient; error: null }
  | { user: null; error: string }

export async function getRequestUser(req?: NextRequest | Request): Promise<AuthResult> {
  const token = getTokenFromRequest(req) || (!req ? await getTokenFromServerCookies() : null)

  if (!token) {
    return { user: null, error: 'Unauthorized' }
  }

  const user = verifySessionToken(token)

  if (!user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, db: adminSupabase, error: null }
}
