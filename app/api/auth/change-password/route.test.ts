import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const {
  getRequestUser,
  verifyPassword,
  hashPassword,
} = vi.hoisted(() => ({
  getRequestUser: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getRequestUser,
}))

vi.mock('@/lib/manual-auth', () => ({
  verifyPassword,
  hashPassword,
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
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { password_hash: 'old-hash' }, error: null }),
      update: vi.fn().mockReturnThis(),
    }

    getRequestUser.mockResolvedValue({ user: { id: 'u1', email: 'u@example.com', username: 'u' }, db: { from: vi.fn(() => chain) }, error: null })
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
    const maybeSingle = vi.fn().mockResolvedValue({ data: { password_hash: 'old-hash' }, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })

    const updateEq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq: updateEq })

    const from = vi.fn((table: string) => {
      if (table === 'auth_credentials') {
        return {
          select: vi.fn().mockReturnValue({ eq }),
          update,
        }
      }
      throw new Error('unexpected table')
    })

    getRequestUser.mockResolvedValue({ user: { id: 'u1', email: 'u@example.com', username: 'u' }, db: { from }, error: null })
    verifyPassword
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
    hashPassword.mockReturnValue('new-hash')

    const req = new Request('http://localhost/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: 'oldpass123', new_password: 'newpass123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(hashPassword).toHaveBeenCalledWith('newpass123')
    expect(update).toHaveBeenCalledWith({ password_hash: 'new-hash' })
  })
})
