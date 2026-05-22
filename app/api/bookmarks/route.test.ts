import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, DELETE } from './route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabase'

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

beforeEach(() => vi.clearAllMocks())

// ── POST ──────────────────────────────────────────────────────────────────────

describe('POST /api/bookmarks', () => {
  it('returns 401 with no token', async () => {
    const res = await POST(makeRequest('POST', { activity_id: 1 }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with bad token', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: new Error('invalid token'),
    } as any)

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'bad-token'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when activity_id is missing', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const res = await POST(makeRequest('POST', {}, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when activity_id is not a number', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const res = await POST(makeRequest('POST', { activity_id: 'abc' }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 201 on success', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const mockBookmark = { user_id: mockUser.id, activity_id: 1, created_at: '2026-05-20' }
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockBookmark, error: null }),
        }),
      }),
    } as any)

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ user_id: mockUser.id, activity_id: 1 })
  })

  it('returns 409 when already bookmarked', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key' },
          }),
        }),
      }),
    } as any)

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(409)
  })

  it('returns 500 on db error', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: '500', message: 'db error' } }),
        }),
      }),
    } as any)

    const res = await POST(makeRequest('POST', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(500)
  })
})

// ── DELETE ────────────────────────────────────────────────────────────────────

describe('DELETE /api/bookmarks', () => {
  it('returns 401 with no token', async () => {
    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with bad token', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: new Error('invalid token'),
    } as any)

    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }, 'bad-token'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when activity_id is missing', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const res = await DELETE(makeRequest('DELETE', {}, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 200 on success', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    } as any)

    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ message: 'bookmark removed' })
  })

  it('returns 500 on db error', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'db error' } }),
        }),
      }),
    } as any)

    const res = await DELETE(makeRequest('DELETE', { activity_id: 1 }, 'valid-token'))
    expect(res.status).toBe(500)
  })
})
