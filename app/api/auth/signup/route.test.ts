import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const {
  from,
  hashPassword,
  createSessionToken,
  randomUUID,
} = vi.hoisted(() => ({
  from: vi.fn(),
  hashPassword: vi.fn(),
  createSessionToken: vi.fn(),
  randomUUID: vi.fn(),
}))

vi.mock('crypto', () => ({ randomUUID }))

vi.mock('@/lib/supabase/admin', () => ({
  getAdminSupabase: vi.fn(() => ({ from })),
}))

vi.mock('@/lib/manual-auth', () => ({
  hashPassword,
  createSessionToken,
  AUTH_COOKIE_NAME: 'bf_session',
}))

beforeEach(() => {
  vi.clearAllMocks()
})


describe('POST /api/auth/signup', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates profile and credential records', async () => {
    const authCredentialsLookup = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }

    const profiles = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis(),
    }

    from.mockImplementation((table: string) => {
      if (table === 'auth_credentials') return authCredentialsLookup
      if (table === 'profiles') return profiles
      throw new Error(`unexpected table: ${table}`)
    })

    randomUUID.mockReturnValue('profile-uuid')
    hashPassword.mockReturnValue('salt:hashed')
    createSessionToken.mockReturnValue('session-token')

    const req = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        username: 'bruin_user',
        first_name: 'Ryder',
        last_name: 'Bear',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(profiles.insert).toHaveBeenCalledOnce()
    expect(authCredentialsLookup.insert).toHaveBeenCalledOnce()
    expect(hashPassword).toHaveBeenCalledWith('Password123!')
    expect(createSessionToken).toHaveBeenCalledOnce()
  })
})