import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const {
  findCredentialEmailExists,
  findUsernameExists,
  createProfile,
  createCredential,
  deleteProfile,
  hashPassword,
  createSessionToken,
  randomUUID,
} = vi.hoisted(() => ({
  findCredentialEmailExists: vi.fn(),
  findUsernameExists: vi.fn(),
  createProfile: vi.fn(),
  createCredential: vi.fn(),
  deleteProfile: vi.fn(),
  hashPassword: vi.fn(),
  createSessionToken: vi.fn(),
  randomUUID: vi.fn(),
}))

vi.mock('crypto', () => ({ randomUUID }))

vi.mock('@/lib/db-endpoints/auth', () => ({
  findCredentialEmailExists,
  findUsernameExists,
  createProfile,
  createCredential,
  deleteProfile,
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
    findCredentialEmailExists.mockResolvedValue({ exists: false })
    findUsernameExists.mockResolvedValue({ exists: false })
    createProfile.mockResolvedValue({ error: null })
    createCredential.mockResolvedValue({ error: null })

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
    expect(createProfile).toHaveBeenCalledOnce()
    expect(createCredential).toHaveBeenCalledOnce()
    expect(hashPassword).toHaveBeenCalledWith('Password123!')
    expect(createSessionToken).toHaveBeenCalledOnce()
  })
})
