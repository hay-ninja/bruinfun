'use client'

import { FormEvent, useMemo, useState } from 'react'

type ActivityCommentItem = {
  comment_id: number
  comment: string
  created_at: string | null
  rating: number | null
}

type ActivityCommentsSectionProps = {
  activityId: string
  initialComments: ActivityCommentItem[]
  loadError: boolean
  isLoggedIn?: boolean
}

type RatingResponse = {
  rating_id: number | string
}

export function formatDate(value: string | null) {
  if (!value) return 'Recent'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString()
}

export function clampRatingValue(value: number): number {
  if (Number.isNaN(value)) return 0
  const truncated = Math.trunc(value)
  return Math.min(10, Math.max(0, truncated))
}

export function sanitizeRatingInput(value: string): number {
  const parsed = Number(value)
  return clampRatingValue(parsed)
}

export default function ActivityCommentsSection({
  activityId,
  initialComments,
  loadError,
  isLoggedIn = true,
}: ActivityCommentsSectionProps) {
  const [comments, setComments] = useState<ActivityCommentItem[]>(initialComments)
  const [ratingInput, setRatingInput] = useState('8')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const trimmedComment = useMemo(() => comment.trim(), [comment])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedComment) {
      setError('Please enter a comment before posting.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const safeRating = sanitizeRatingInput(ratingInput)

      const ratingRes = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_id: activityId, rating: safeRating }),
      })
      const ratingJson = (await ratingRes.json()) as RatingResponse | { error?: string }

      if (!ratingRes.ok) {
        throw new Error('error' in ratingJson ? ratingJson.error || 'Could not save rating.' : 'Could not save rating.')
      }

      const commentRes = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activityId,
          rating_id: (ratingJson as RatingResponse).rating_id,
          comment: trimmedComment,
        }),
      })
      const commentJson = (await commentRes.json()) as {
        comment_id?: number
        comment?: string
        created_at?: string | null
        error?: string
      }

      if (!commentRes.ok) {
        throw new Error(commentJson.error || 'Could not save comment.')
      }

      setComments((prev) => [
        {
          comment_id: commentJson.comment_id ?? Date.now(),
          comment: commentJson.comment ?? trimmedComment,
          created_at: commentJson.created_at ?? new Date().toISOString(),
          rating: safeRating,
        },
        ...prev,
      ])
      setRatingInput(String(safeRating))
      setComment('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save your comment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 border-t border-[rgba(192,199,209,0.6)] pt-6">
      <h2 className="font-[family-name:var(--font-nunito)] text-[24px] font-semibold text-[#191c20]">Ratings</h2>

      {!isLoggedIn ? (
        <div className="mt-4 rounded-xl border border-[rgba(192,199,209,0.6)] bg-white/80 p-4">
          <p className="text-[15px] text-[#6d7783]">
            Please <a href="/login" className="text-[#1f93cd] underline">log in</a> to leave a rating or comment.
          </p>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-[rgba(192,199,209,0.6)] bg-white/80 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label htmlFor="activity-rating" className="text-[14px] font-medium text-[#323232]">Your rating</label>
          <input
            id="activity-rating"
            type="text"
            inputMode="decimal"
            value={ratingInput}
            onChange={(event) => {
              const nextValue = event.target.value
              if (nextValue === '' || /^-?\d*\.?\d*$/.test(nextValue)) {
                setRatingInput(nextValue)
              }
            }}
            onBlur={() => {
              if (!ratingInput.trim()) {
                setRatingInput('')
                return
              }

              setRatingInput(String(sanitizeRatingInput(ratingInput)))
            }}
            className="w-20 rounded-md border border-[#d5dce3] px-2 py-1 text-[14px] text-[#191c20]"
          />
          <span className="text-[13px] text-[#6d7783]">0 to 10</span>
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your thoughts about this activity"
          rows={4}
          className="w-full rounded-lg border border-[#d5dce3] px-3 py-2 text-[14px] text-[#191c20] outline-none focus:border-[#1f93cd] focus:ring-2 focus:ring-[#1f93cd]/20"
        />

        {error ? <p className="mt-2 text-[13px] text-red-500">{error}</p> : null}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1f93cd] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#1b86bc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Posting...' : 'Post Rating'}
          </button>
        </div>
      </form>
      )}

      {loadError ? (
        <p className="mt-4 text-[15px] text-red-500">Could not load existing comments right now.</p>
      ) : null}

      {!loadError && comments.length === 0 ? (
        <p className="mt-4 text-[15px] text-[#6d7783]">No comments yet.</p>
      ) : null}

      {!loadError && comments.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {comments.map((entry) => (
            <article key={entry.comment_id} className="rounded-xl border border-[rgba(192,199,209,0.6)] bg-white/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-2 text-[13px] text-[#6d7783]">
                <span>{formatDate(entry.created_at)}</span>
                {typeof entry.rating === 'number' ? <span>{entry.rating} ★</span> : null}
              </div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#323232]">{entry.comment}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
