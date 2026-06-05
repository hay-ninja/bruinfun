import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const {
  findCredentialByEmail,
  findProfileById,
  verifyPassword,
  createSessionToken,
} = vi.hoisted(() => ({
  findCredentialByEmail: vi.fn(),
  findProfileById: vi.fn(),
  verifyPassword: vi.fn(),
  createSessionToken: vi.fn(),
}))

vi.mock('@/lib/db-endpoints/auth', () => ({
  findCredentialByEmail,
  findProfileById,
}))

vi.mock('@/lib/manual-auth', () => ({
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME: 'bf_session',
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/auth/login', () => {
  it('returns 400 when email/password are missing', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 when login succeeds', async () => {
    findCredentialByEmail.mockResolvedValue({
      data: { profile_id: 'u1', password_hash: 'salt:hash' },
      error: null,
    })

    findProfileById.mockResolvedValue({
      data: { username: 'bruin_user' },
      error: null,
    })

    verifyPassword.mockReturnValue(true)
    createSessionToken.mockReturnValue('session-token')

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(verifyPassword).toHaveBeenCalledWith('Password123!', 'salt:hash')
    expect(createSessionToken).toHaveBeenCalledOnce()
  })
})
