// auth domain — credential + profile db ops for the manual auth system
import { getAdminSupabase } from '@/lib/supabase/admin'

// look up email in auth_credentials — returns profile_id + password_hash
export async function findCredentialByEmail(
  email: string
): Promise<{ data: { profile_id: string; password_hash: string } | null; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('auth_credentials')
    .select('profile_id, password_hash')
    .eq('email', email)
    .maybeSingle()

  return { data, error }
}

// get credential row for a profile id — used for change-password
export async function findCredentialByProfileId(
  profileId: string
): Promise<{ data: { password_hash: string } | null; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('auth_credentials')
    .select('password_hash')
    .eq('profile_id', profileId)
    .maybeSingle()

  return { data, error }
}

// get username for a profile id
export async function findProfileById(
  profileId: string
): Promise<{ data: { username: string } | null; error: any }> {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('profiles')
    .select('username')
    .eq('profile_id', profileId)
    .maybeSingle()

  return { data, error }
}

// insert a new profile row
export async function createProfile(
  profileId: string,
  username: string,
  firstName: string,
  lastName: string
): Promise<{ error: any }> {
  const db = getAdminSupabase()
  const { error } = await db.from('profiles').insert({
    profile_id: profileId,
    username,
    first_name: firstName,
    last_name: lastName,
  })
  return { error }
}

// insert a new auth_credentials row
export async function createCredential(
  profileId: string,
  email: string,
  passwordHash: string
): Promise<{ error: any }> {
  const db = getAdminSupabase()
  const { error } = await db.from('auth_credentials').insert({
    profile_id: profileId,
    email,
    password_hash: passwordHash,
  })
  return { error }
}

// rollback — delete a profile row (used when credential insert fails)
export async function deleteProfile(profileId: string): Promise<{ error: any }> {
  const db = getAdminSupabase()
  const { error } = await db.from('profiles').delete().eq('profile_id', profileId)
  return { error }
}

// check if an email is already registered
export async function findCredentialEmailExists(
  email: string
): Promise<{ exists: boolean }> {
  const db = getAdminSupabase()
  const { data } = await db
    .from('auth_credentials')
    .select('profile_id')
    .eq('email', email)
    .maybeSingle()

  return { exists: !!data }
}

// check if a username is already taken
export async function findUsernameExists(username: string): Promise<{ exists: boolean }> {
  const db = getAdminSupabase()
  const { data } = await db
    .from('profiles')
    .select('profile_id')
    .eq('username', username)
    .maybeSingle()

  return { exists: !!data }
}

// update the stored password hash for a profile
export async function updatePasswordHash(
  profileId: string,
  newHash: string
): Promise<{ error: any }> {
  const db = getAdminSupabase()
  const { error } = await db
    .from('auth_credentials')
    .update({ password_hash: newHash })
    .eq('profile_id', profileId)

  return { error }
}
