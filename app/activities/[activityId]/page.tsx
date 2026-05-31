import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ activityId: string }>
}

type ActivityComment = {
  comment_id: number
  comment: string
  created_at: string | null
  ratings: { rating: number } | { rating: number }[] | null
}

export default async function ActivityDetailsPage({ params }: PageProps) {
  const { activityId } = await params
  const supabase = await createServerSupabaseClient()

  const parsedId = Number(activityId)
  const validId = Number.isInteger(parsedId) ? parsedId : null

  if (!validId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-[90px] py-[48px]">
          <p className="text-red-500">Invalid activity id.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const { data: activity, error } = await supabase
    .from('activities')
    .select('activity_id, title, description, category, location, event_date, image_url, created_at, avg_rating')
    .eq('activity_id', validId)
    .single()

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('comment_id, comment, created_at, ratings(rating)')
    .eq('activity_id', validId)
    .order('created_at', { ascending: false })

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-[90px] py-[48px]">
          <p className="text-red-500">Activity not found.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-[90px] py-[48px]">
        <div className="mx-auto max-w-[920px] rounded-[24px] border border-[rgba(192,199,209,0.6)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[0px_1.68px_16.78px_-1px_rgba(0,0,0,0.12)]">
          {activity.image_url ? (
            <img
              src={activity.image_url}
              alt={activity.title}
              className="mb-6 h-[360px] w-full rounded-[16px] object-cover"
            />
          ) : null}

          <h1 className="font-[family-name:var(--font-nunito)] text-[36px] font-semibold text-[#191c20]">
            {activity.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6d7783]">
            <span className="rounded-full bg-[#eef6fb] px-3 py-1 capitalize">{activity.category ?? 'uncategorized'}</span>
            <span>{activity.location ?? 'Location unavailable'}</span>
            {activity.avg_rating ? <span>{activity.avg_rating} ★</span> : null}
          </div>

          <p className="mt-6 whitespace-pre-wrap text-[16px] leading-relaxed text-[#323232]">
            {activity.description || 'No description available.'}
          </p>

          <section className="mt-8 border-t border-[rgba(192,199,209,0.6)] pt-6">
            <h2 className="font-[family-name:var(--font-nunito)] text-[24px] font-semibold text-[#191c20]">Comments</h2>

            {commentsError ? (
              <p className="mt-4 text-[15px] text-red-500">Could not load comments right now.</p>
            ) : null}

            {!commentsError && (!comments || comments.length === 0) ? (
              <p className="mt-4 text-[15px] text-[#6d7783]">No comments yet.</p>
            ) : null}

            {!commentsError && comments && comments.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {(comments as ActivityComment[]).map((entry) => {
                  const nestedRating = Array.isArray(entry.ratings)
                    ? entry.ratings[0]?.rating
                    : entry.ratings?.rating

                  return (
                    <article key={entry.comment_id} className="rounded-xl border border-[rgba(192,199,209,0.6)] bg-white/70 p-4">
                      <div className="mb-2 flex items-center justify-between gap-2 text-[13px] text-[#6d7783]">
                        <span>
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                        {typeof nestedRating === 'number' ? <span>{nestedRating} ★</span> : null}
                      </div>
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#323232]">{entry.comment}</p>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
