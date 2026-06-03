'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'

type BookmarkButtonProps = {
  activityId: number
  initialBookmarked: boolean
  token: string
}

export default function BookmarkButton({ activityId, initialBookmarked, token }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (loading) return

    const prev = bookmarked
    setBookmarked(!prev) // optimistic update
    setLoading(true)

    try {
      const res = await fetch('/api/bookmarks', {
        method: prev ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      disabled={loading}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className={`p-2 rounded-full transition-colors ${loading ? 'opacity-50' : 'hover:bg-gray-100'}`}
    >
      <Bookmark
        size={20}
        className={bookmarked ? 'fill-blue-600 stroke-blue-600' : 'fill-black/20 stroke-white'}
      />
    </button>
  )
}
