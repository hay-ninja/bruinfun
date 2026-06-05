import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

vi.mock('@/lib/auth', () => ({
  getRequestUser: vi.fn(),
}))

vi.mock('@/lib/db-endpoints/ratings', () => ({
  createRating: vi.fn(),
}))

import { getRequestUser } from '@/lib/auth'
import { createRating } from '@/lib/db-endpoints/ratings'

const mockUser = { id: 'user-123' }

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getRequestUser).mockResolvedValue({ user: null, error: 'Unauthorized' })
})

describe('POST /api/ratings', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await POST(makeRequest({ activity_id: 1, rating: 8 }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when rating is out of range', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makeRequest({ activity_id: 1, rating: 11 }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with created rating on success', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })
    const mockRating = { rating_id: 5, activity_id: 1, profile_id: mockUser.id, rating: 8 }
    vi.mocked(createRating).mockResolvedValue({ data: mockRating, error: null })

    const res = await POST(makeRequest({ activity_id: 1, rating: 8 }))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject(mockRating)
  })
})
