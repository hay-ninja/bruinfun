import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, DELETE } from './route'
import { NextRequest } from 'next/server'

const { mockGetRequestUser } = vi.hoisted(() => ({
  mockGetRequestUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getRequestUser: mockGetRequestUser,
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockUser = { id: 'user-123' }

function makeRequest(method: 'POST' | 'DELETE', body: object, token?: string) {
  return new NextRequest('http://localhost/api/bookmarks', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

function makeAuthDb(fromImpl: ReturnType<typeof vi.fn>) {
  return {
    from: fromImpl,
  }
}

beforeEach(() => vi.clearAllMocks())

// ── POST ──────────────────────────────────────────────────────────────────────

describe('POST /api/bookmarks', () => {
  it('returns 401 with no token', async () => {
    mockGetRequestUser.mockResolvedValue({ user: null, error: 'Unauthorized' })
    const res = await POST(makeRequest('POST', { activity_id: 1 }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with bad token', async () => {
    mockGetRequestUser.mockResolvedValue({ user: null, error: 'Unauthorized' })

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'bad-token'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when activity_id is missing', async () => {
    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(vi.fn()),
      error: null,
    })

    const res = await POST(makeRequest('POST', {}, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('accepts string activity IDs', async () => {
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { profile_id: mockUser.id, activity_id: 'activity-uuid', created_at: '2026-05-20' }, error: null }),
        }),
      }),
    })

    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(from),
      error: null,
    })

    const res = await POST(makeRequest('POST', { activity_id: 'activity-uuid' }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ profile_id: mockUser.id, activity_id: 'activity-uuid' })
  })

  it('returns 201 on success', async () => {
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { profile_id: mockUser.id, activity_id: 1, created_at: '2026-05-20' }, error: null }),
        }),
      }),
    })

    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(from),
      error: null,
    })

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ profile_id: mockUser.id, activity_id: 1 })
  })

  it('returns 409 when already bookmarked', async () => {
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key' },
          }),
        }),
      }),
    })

    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(from),
      error: null,
    })

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(409)
  })

  it('returns 500 on db error', async () => {
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: '500', message: 'db error' } }),
        }),
      }),
    })

    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(from),
      error: null,
    })

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(500)
  })
})

// ── DELETE ────────────────────────────────────────────────────────────────────

describe('DELETE /api/bookmarks', () => {
  it('returns 401 with no token', async () => {
    mockGetRequestUser.mockResolvedValue({ user: null, error: 'Unauthorized' })
    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with bad token', async () => {
    mockGetRequestUser.mockResolvedValue({ user: null, error: 'Unauthorized' })

    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }, 'bad-token'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when activity_id is missing', async () => {
    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(vi.fn()),
      error: null,
    })

    const res = await DELETE(makeRequest('DELETE', {}, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 200 on success', async () => {
    const from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    })

    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(from),
      error: null,
    })

    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ message: 'bookmark removed' })
  })

  it('returns 500 on db error', async () => {
    const from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'db error' } }),
        }),
      }),
    })

    mockGetRequestUser.mockResolvedValue({
      user: mockUser,
      db: makeAuthDb(from),
      error: null,
    })

    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(500)
  })
})
