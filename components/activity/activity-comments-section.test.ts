import { describe, expect, it } from 'vitest'
import { clampRatingValue, formatDate } from './activity-comments-section'

describe('activity comments helpers', () => {
  describe('clampRatingValue', () => {
    it('clamps values to the 1-10 range', () => {
      expect(clampRatingValue(-10)).toBe(1)
      expect(clampRatingValue(0)).toBe(1)
      expect(clampRatingValue(7)).toBe(7)
      expect(clampRatingValue(22)).toBe(10)
    })

    it('defaults NaN to 1', () => {
      expect(clampRatingValue(Number.NaN)).toBe(1)
    })
  })

  describe('formatDate', () => {
    it('returns Recent for missing/invalid dates', () => {
      expect(formatDate(null)).toBe('Recent')
      expect(formatDate('bad-date')).toBe('Recent')
    })

    it('returns locale date string for valid dates', () => {
      const result = formatDate('2026-05-30T10:00:00.000Z')
      expect(result).not.toBe('Recent')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
