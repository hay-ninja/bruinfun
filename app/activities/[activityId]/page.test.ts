import { describe, expect, it } from 'vitest'
import { normalizeActivityComments, toValidActivityId } from './page'

describe('activity detail helpers', () => {
  describe('toValidActivityId', () => {
    it('returns positive integer IDs as strings', () => {
      expect(toValidActivityId('42')).toBe('42')
    })

    it('returns UUID activity IDs', () => {
      expect(toValidActivityId('9acb51f8-75a6-4796-9ff1-e6ebcbc8160f')).toBe('9acb51f8-75a6-4796-9ff1-e6ebcbc8160f')
    })

    it('rejects non-numeric and non-positive values', () => {
      expect(toValidActivityId('abc')).toBeNull()
      expect(toValidActivityId('0')).toBeNull()
      expect(toValidActivityId('-5')).toBeNull()
      expect(toValidActivityId('3.14')).toBeNull()
    })
  })

  describe('normalizeActivityComments', () => {
    it('normalizes nested ratings object and array shapes', () => {
      const normalized = normalizeActivityComments([
        {
          comment_id: 1,
          comment: 'Great event',
          created_at: '2026-05-30T10:00:00.000Z',
          ratings: { rating: 9 },
        },
        {
          comment_id: 2,
          comment: 'Could be better',
          created_at: null,
          ratings: [{ rating: 5 }],
        },
        {
          comment_id: 3,
          comment: 'No rating relation',
          created_at: null,
          ratings: null,
        },
      ])

      expect(normalized).toEqual([
        {
          comment_id: 1,
          comment: 'Great event',
          created_at: '2026-05-30T10:00:00.000Z',
          rating: 9,
        },
        {
          comment_id: 2,
          comment: 'Could be better',
          created_at: null,
          rating: 5,
        },
        {
          comment_id: 3,
          comment: 'No rating relation',
          created_at: null,
          rating: null,
        },
      ])
    })

    it('returns empty array for nullish input', () => {
      expect(normalizeActivityComments(null)).toEqual([])
      expect(normalizeActivityComments(undefined)).toEqual([])
    })
  })
})
