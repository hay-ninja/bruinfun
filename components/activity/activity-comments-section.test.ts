import { describe, expect, it } from 'vitest'
import { clampRatingValue, formatDate, sanitizeRatingInput } from './activity-comments-section'

describe('activity comments helpers', () => {
  describe('clampRatingValue', () => {
    it('clamps values to the 0-10 range and truncates decimals', () => {
      expect(clampRatingValue(-10)).toBe(0)
      expect(clampRatingValue(0)).toBe(0)
      expect(clampRatingValue(7)).toBe(7)
      expect(clampRatingValue(7.9)).toBe(7)
      expect(clampRatingValue(22)).toBe(10)
    })

    it('defaults NaN to 0', () => {
      expect(clampRatingValue(Number.NaN)).toBe(0)
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

  describe('sanitizeRatingInput', () => {
    it('sanitizes empty or invalid strings to safe default', () => {
      expect(sanitizeRatingInput('')).toBe(0)
      expect(sanitizeRatingInput('abc')).toBe(0)
    })

    it('sanitizes out-of-range values to 1-10 bounds', () => {
      expect(sanitizeRatingInput('-4')).toBe(0)
      expect(sanitizeRatingInput('99')).toBe(10)
      expect(sanitizeRatingInput('7')).toBe(7)
      expect(sanitizeRatingInput('7.9')).toBe(7)
    })
  })
})
