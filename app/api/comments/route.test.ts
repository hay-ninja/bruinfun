import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

vi.mock('@/lib/auth', () => ({
  getRequestUser: vi.fn(),
}))

import { getRequestUser } from '@/lib/auth'

const mockUser = { id: 'user-123' }
const mockDb = { from: vi.fn() }

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.from.mockReset()
  vi.mocked(getRequestUser).mockResolvedValue({ user: null, error: 'Unauthorized' })
})

describe('POST /api/comments', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await POST(makeRequest({ activity_id: 1, rating_id: 5, comment: 'Loved it' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when comment is missing', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, db: mockDb as any, error: null })

    const res = await POST(makeRequest({ activity_id: 1, rating_id: 5 }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with created comment on success', async () => {
    vi.mocked(getRequestUser).mockResolvedValue({ user: mockUser as any, db: mockDb as any, error: null })
    const mockComment = { comment_id: 7, activity_id: 1, rating_id: 5, profile_id: mockUser.id, comment: 'Loved it' }
    mockDb.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockComment, error: null }),
        }),
      }),
    } as any)

    const res = await POST(makeRequest({ activity_id: 1, rating_id: 5, comment: 'Loved it' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject(mockComment)
  })
})
