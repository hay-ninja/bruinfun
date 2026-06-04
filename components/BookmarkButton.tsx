'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'

type BookmarkButtonProps = {
  activityId: string
  initialBookmarked: boolean
  token?: string
  variant?: 'card' | 'overlay'
}

const VARIANTS = {
  card: {
    size: 20,
    active: 'fill-blue-600 stroke-blue-600',
    inactive: 'fill-black/20 stroke-white hover:fill-black/40',
  },
  overlay: {
    size: 24,
    active: 'fill-blue-600 stroke-blue-600',
    inactive: 'fill-transparent stroke-black hover:fill-black/10',
  },
}

export default function BookmarkButton({ activityId, initialBookmarked, token, variant = 'card' }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    const prev = bookmarked
    setBookmarked(!prev) // optimistic update
    setLoading(true)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/bookmarks', {
        method: prev ? 'DELETE' : 'POST',
        headers,
        body: JSON.stringify({ activity_id: activityId }),
      })

      if (!res.ok) {
        setBookmarked(prev) // revert if something went wrong
      }
    } catch (err) {
      setBookmarked(prev) // revert on network error
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className={loading ? 'opacity-50 cursor-wait' : ''}
    >
      <Bookmark
        size={VARIANTS[variant].size}
        className={bookmarked ? VARIANTS[variant].active : VARIANTS[variant].inactive}
      />
    </button>
  )
}
