import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const {
  getRequestUser,
  verifyPassword,
  hashPassword,
  findCredentialByProfileId,
  updatePasswordHash,
} = vi.hoisted(() => ({
  getRequestUser: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  findCredentialByProfileId: vi.fn(),
  updatePasswordHash: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getRequestUser,
}))

vi.mock('@/lib/manual-auth', () => ({
  verifyPassword,
  hashPassword,
}))

vi.mock('@/lib/db-endpoints/auth', () => ({
  findCredentialByProfileId,
  updatePasswordHash,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/auth/change-password', () => {
  it('returns 401 when unauthenticated', async () => {
    getRequestUser.mockResolvedValue({ user: null, error: 'Unauthorized' })

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: 'oldpass123', new_password: 'newpass123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when current password is wrong', async () => {
    getRequestUser.mockResolvedValue({ user: { id: 'u1', email: 'u@example.com', username: 'u' }, error: null })
    findCredentialByProfileId.mockResolvedValue({ data: { password_hash: 'old-hash' }, error: null })
    verifyPassword.mockReturnValue(false)

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: 'badpass123', new_password: 'newpass123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('updates password when current password is correct', async () => {
    getRequestUser.mockResolvedValue({ user: { id: 'u1', email: 'u@example.com', username: 'u' }, error: null })
    findCredentialByProfileId.mockResolvedValue({ data: { password_hash: 'old-hash' }, error: null })
    verifyPassword
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
    hashPassword.mockReturnValue('new-hash')
    updatePasswordHash.mockResolvedValue({ error: null })

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: 'oldpass123', new_password: 'newpass123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(hashPassword).toHaveBeenCalledWith('newpass123')
    expect(updatePasswordHash).toHaveBeenCalledWith('u1', 'new-hash')
  })
})
