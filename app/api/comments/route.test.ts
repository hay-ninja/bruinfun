import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

vi.mock('@/lib/auth', () => ({
  getRequestUser: vi.fn(),
}))

vi.mock('@/lib/db-endpoints/comments', () => ({
  createComment: vi.fn(),
}))

import { getRequestUser } from '@/lib/auth'
import { createComment } from '@/lib/db-endpoints/comments'

const mockUser = { id: 'user-123' }

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getRequestUser).mockResolvedValue({ user: null, error: 'Unauthorized' })
})

describe('POST /api/comments', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await POST(makeRequest({ activity_id: 1, rating_id: 5, comment: 'Loved it' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when comment is missing', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })

    const res = await POST(makeRequest({ activity_id: 1, rating_id: 5 }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with created comment on success', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, error: null })
    const mockComment = { comment_id: 7, activity_id: 1, rating_id: 5, profile_id: mockUser.id, comment: 'Loved it' }
    vi.mocked(createComment).mockResolvedValue({ data: mockComment, error: null })

    const res = await POST(makeRequest({ activity_id: 1, rating_id: 5, comment: 'Loved it' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject(mockComment)
  })
})
