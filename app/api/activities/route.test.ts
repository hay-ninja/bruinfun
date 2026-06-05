//TDD file (test driven development)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db-endpoints/activities', () => ({
  createActivity: vi.fn(),
  searchActivities: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getRequestUser: vi.fn(),
}))

import { createActivity, searchActivities } from '@/lib/db-endpoints/activities'
import { getRequestUser } from '@/lib/auth'

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

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getRequestUser).mockResolvedValue({ user: null, error: 'Unauthorized' })
})

//── TESITNG FOR POST ──────────────────────────────────────────────────────────────────────

describe('POST /api/activities', () => {
  it('returns 401 when no token provided', async () => {
    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: null, error: 'Unauthorized' })

    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors' }, 'bad-token'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makePostRequest({ description: 'Great hike', category: 'outdoors', location: 'LA' }, 'valid-token'))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'title is required' })
  })

  it('returns 400 when description is missing', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makePostRequest({ title: 'Hike', category: 'outdoors', location: 'LA' }, 'valid-token'))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'description is required' })
  })

  it('returns 400 when category is invalid', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makePostRequest({ title: 'Hike', description: 'Great hike', category: 'invalid', location: 'LA' }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when category is missing', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makePostRequest({ title: 'Hike', description: 'Great hike', location: 'LA' }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when location is missing', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makePostRequest({ title: 'Hike', description: 'Great hike', category: 'outdoors' }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 201 with the created activity on success', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const mockActivity = { activity_id: 1, title: 'Hike', description: 'Great hike', category: 'outdoors', location: 'LA', profile_id: mockUser.id }
    vi.mocked(createActivity).mockResolvedValue({ data: mockActivity, error: null })

    const res = await POST(makePostRequest({ title: 'Hike', description: 'Great hike', category: 'outdoors', location: 'LA' }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ title: 'Hike', category: 'outdoors' })
  })

  it('returns 201 and stores null image_url when not provided', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const mockActivity = { activity_id: 2, title: 'Concert', description: 'Live music', category: 'arts', location: 'Westwood', image_url: null, profile_id: mockUser.id }
    vi.mocked(createActivity).mockResolvedValue({ data: mockActivity, error: null })

    const res = await POST(makePostRequest({ title: 'Concert', description: 'Live music', category: 'arts', location: 'Westwood' }, 'valid-token'))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ image_url: null })
  })

  it('returns 500 when supabase insert fails', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    vi.mocked(createActivity).mockResolvedValue({ data: null, error: { message: 'db error' } })

    const res = await POST(makePostRequest({ title: 'Hike', description: 'Great hike', category: 'outdoors', location: 'LA' }, 'valid-token'))
    expect(res.status).toBe(500)
  })
})

//── TESTING FOR GET ───────────────────────────────────────────────────────────────────────

describe('GET /api/activities', () => {
  it('returns activities and null nextCursor when fewer than 25 results', async () => {
    const activities = [{ id: 5, title: 'Hike', category: 'outdoors' }]
    vi.mocked(searchActivities).mockResolvedValue({ data: activities, nextCursor: null, error: null })

    const res = await GET(makeGetRequest())
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.data).toEqual(activities)
    expect(json.nextCursor).toBeNull()
  })

  it('returns nextCursor equal to last id when exactly 25 results', async () => {
    const activities = Array.from({ length: 25 }, (_, i) => ({ activity_id: i + 1, title: `Activity ${i}` }))
    vi.mocked(searchActivities).mockResolvedValue({ data: activities, nextCursor: 25, error: null })

    const res = await GET(makeGetRequest())
    const json = await res.json()
    expect(json.nextCursor).toBe(25)
  })

  it('filters by category when category param is provided', async () => {
    const activities = [{ id: 1, title: 'Gallery', category: 'arts' }]
    vi.mocked(searchActivities).mockResolvedValue({ data: activities, nextCursor: null, error: null })

    await GET(makeGetRequest({ category: 'arts' }))
    expect(searchActivities).toHaveBeenCalledWith('arts', null, null)
  })

  it('searches title and location when search param is provided', async () => {
    const activities = [{ activity_id: 1, title: 'Museum', location: 'Downtown' }]
    vi.mocked(searchActivities).mockResolvedValue({ data: activities, nextCursor: null, error: null })

    await GET(makeGetRequest({ search: 'museum' }))
    expect(searchActivities).toHaveBeenCalledWith(null, 'museum', null)
  })

  it('applies cursor filter when cursor param is provided', async () => {
    const activities = [{ id: 3, title: 'Hike' }]
    vi.mocked(searchActivities).mockResolvedValue({ data: activities, nextCursor: null, error: null })

    await GET(makeGetRequest({ cursor: '10' }))
    expect(searchActivities).toHaveBeenCalledWith(null, null, '10')
  })

  it('returns 500 when supabase query fails', async () => {
    vi.mocked(searchActivities).mockResolvedValue({ data: [], nextCursor: null, error: { message: 'db error' } })

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(500)
  })
})
