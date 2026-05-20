// TDD file (test driven development)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabase'

const mockUser = { id: 'user-123' }

function makePostRequest(body: object, token?: string) {
  return new NextRequest('http://localhost/api/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/activities')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

beforeEach(() => vi.clearAllMocks())

// ── TESITNG FOR POST ──────────────────────────────────────────────────────────────────────

describe('POST /api/activities', () => {
  it('returns 401 when no token provided', async () => {
    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: new Error('invalid token'),
    } as any)

    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors' }, 'bad-token'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const res = await POST(makePostRequest({ category: 'outdoors' }, 'valid-token'))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'title is required' })
  })

  it('returns 400 when category is invalid', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const res = await POST(makePostRequest({ title: 'Hike', category: 'invalid' }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when category is missing', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const res = await POST(makePostRequest({ title: 'Hike' }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 201 with the created activity on success', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const mockActivity = { id: 1, title: 'Hike', category: 'outdoors', user_id: mockUser.id }
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockActivity, error: null }),
        }),
      }),
    } as any)

    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors' }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ title: 'Hike', category: 'outdoors' })
  })

  it('returns 201 and stores null image_url when not provided', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    const mockActivity = { id: 2, title: 'Concert', category: 'arts', image_url: null, user_id: mockUser.id }
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockActivity, error: null }),
        }),
      }),
    } as any)

    const res = await POST(makePostRequest({ title: 'Concert', category: 'arts' }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ image_url: null })
  })

  it('returns 500 when supabase insert fails', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser }, error: null,
    } as any)

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        }),
      }),
    } as any)

    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors' }, 'valid-token'))
    expect(res.status).toBe(500)
  })
})

// ── TESTING FOR GET ───────────────────────────────────────────────────────────────────────

describe('GET /api/activities', () => {
  function mockQueryResult(data: object[], error: any = null) {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data, error }),
    }
    // resolve the chain even when .lt() is never called
    chain.limit.mockReturnValue({
      ...chain,
      then: (resolve: any) => Promise.resolve({ data, error }).then(resolve),
    })
    vi.mocked(supabase.from).mockReturnValue(chain)
  }

  it('returns activities and null nextCursor when fewer than 25 results', async () => {
    const activities = [{ id: 5, title: 'Hike', category: 'outdoors' }]
    mockQueryResult(activities)

    const res = await GET(makeGetRequest())
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.data).toEqual(activities)
    expect(json.nextCursor).toBeNull()
  })

  it('returns nextCursor equal to last id when exactly 25 results', async () => {
    const activities = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, title: `Activity ${i}` }))
    mockQueryResult(activities)

    const res = await GET(makeGetRequest())
    const json = await res.json()
    expect(json.nextCursor).toBe(25)
  })

  it('filters by category when category param is provided', async () => {
    const activities = [{ id: 1, title: 'Gallery', category: 'arts' }]
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data: activities, error: null }),
    }
    chain.limit.mockReturnValue({
      ...chain,
      then: (resolve: any) => Promise.resolve({ data: activities, error: null }).then(resolve),
    })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await GET(makeGetRequest({ category: 'arts' }))
    expect(chain.eq).toHaveBeenCalledWith('category', 'arts')
  })

  it('applies cursor filter when cursor param is provided', async () => {
    const activities = [{ id: 3, title: 'Hike' }]
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data: activities, error: null }),
    }
    chain.limit.mockReturnValue({ ...chain })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await GET(makeGetRequest({ cursor: '10' }))
    expect(chain.lt).toHaveBeenCalledWith('id', '10')
  })

  it('returns 500 when supabase query fails', async () => {
    mockQueryResult([], { message: 'db error' })

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(500)
  })
})
