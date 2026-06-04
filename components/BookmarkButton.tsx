'use client'

import { useEffect, useState } from 'react'
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

const BOOKMARK_EVENT = 'bookmark-change'

function broadcast(activityId: string, bookmarked: boolean) {
  window.dispatchEvent(new CustomEvent(BOOKMARK_EVENT, { detail: { activityId, bookmarked } }))
}

export default function BookmarkButton({ activityId, initialBookmarked, token, variant = 'card' }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onBookmarkChange(e: Event) {
      const { activityId: id, bookmarked: next } = (e as CustomEvent<{ activityId: string; bookmarked: boolean }>).detail
      if (id === activityId) setBookmarked(next)
    }
    window.addEventListener(BOOKMARK_EVENT, onBookmarkChange)
    return () => window.removeEventListener(BOOKMARK_EVENT, onBookmarkChange)
  }, [activityId])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    const prev = bookmarked
    const next = !prev
    setBookmarked(next)
    broadcast(activityId, next)
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
        setBookmarked(prev)
        broadcast(activityId, prev)
      }
    } catch (err) {
      setBookmarked(prev)
      broadcast(activityId, prev)
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
