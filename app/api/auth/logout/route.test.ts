import { describe, expect, it } from 'vitest'
import { POST } from './route'

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears auth cookie', async () => {
    const res = await POST()
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('bf_session=')
  })
})