'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/activity/activity-card'

type Tab = 'posted' | 'completed' | 'bookmarks'

type Activity = {
    activity_id: number
    title: string
    category: string | null
    image_url: string | null
    location: string | null
    avg_rating?: number | null
}

type CompletedEntry = {
    rating_id: number
    rating: number
    activities: Activity | Activity[] | null
}

type BookmarkEntry = {
    activity_id: number
    activities: Activity | Activity[] | null
}

type ProfileData = {
    profile: { username: string; first_name: string; last_name: string }
    posted: Activity[]
    completed: CompletedEntry[]
    bookmarks: BookmarkEntry[]
}

// Supabase joined relations can come back as a single object or an array
function toActivity(raw: Activity | Activity[] | null): Activity | null {
    if (!raw) return null
    return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

export default function ProfilePage() {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('posted')
    const [data, setData] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/profile').then(async (res) => {
            if (res.status === 401) {
                router.push('/login')
                return
            }
            if (!res.ok) {
                setError('could not load profile')
                setLoading(false)
                return
            }
            setData(await res.json())
            setLoading(false)
        })
    }, [router])

    if (loading) return (
        <div className="min-h-screen bg-white"><Header />
            <main className="px-[90px] py-[48px]"><p className="text-[#a0a3a8]">Loading...</p></main>
        <Footer /></div>
    )

    if (error || !data) return (
        <div className="min-h-screen bg-white"><Header />
            <main className="px-[90px] py-[48px]"><p className="text-red-500">{error || 'something went wrong'}</p></main>
        <Footer /></div>
    )

    const { profile, posted, completed, bookmarks } = data

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }
    const bookmarkedIds = new Set(bookmarks.map((b) => String(b.activity_id)))
    const tabs: Tab[] = ['posted', 'completed', 'bookmarks']

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="px-[90px] py-[48px] flex flex-col gap-[32px]">

                {/* name + username */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[4px]">
                        <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20]">
                            {profile.first_name} {profile.last_name}
                        </h1>
                        <p className="text-[#a0a3a8] text-[15px]">@{profile.username}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-[14px] text-[#a0a3a8] hover:text-[#191c20] border border-[#e0e0e0] hover:border-[#191c20] rounded-[8px] px-[16px] py-[8px] transition-colors"
                    >
                        Log out
                    </button>
                </div>

                {/* tab switcher */}
                <div className="flex gap-[10px] border-b border-[#e0e0e0]">
                    {tabs.map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`pb-[12px] px-[4px] text-[15px] font-medium capitalize border-b-2 transition-colors ${
                                tab === t
                                    ? 'border-[#1f93cd] text-[#1f93cd]'
                                    : 'border-transparent text-[#a0a3a8] hover:text-[#191c20]'
                            }`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* posted */}
                {tab === 'posted' && (posted.length === 0
                    ? <p className="text-[#a0a3a8]">No activities posted yet.</p>
                    : <div className="grid grid-cols-4 gap-[28px]">
                        {posted.map((a) => (
                            <ActivityCard key={a.activity_id} id={String(a.activity_id)} title={a.title} rating={a.avg_rating ?? 0}
                                location={a.location ?? ''} category={a.category as any}
                                imageUrl={a.image_url}
                                href={`/activities/${a.activity_id}`}
                                isBookmarked={bookmarkedIds.has(String(a.activity_id))}
                                className="w-full" />
                        ))}
                    </div>
                )}

                {/* completed - show rating next to card */}
                {tab === 'completed' && (completed.length === 0
                    ? <p className="text-[#a0a3a8]">No completed activities yet.</p>
                    : <div className="grid grid-cols-4 gap-[28px]">
                        {completed.map((entry) => {
                            const a = toActivity(entry.activities)
                            if (!a) return null
                            return (
                                <ActivityCard key={entry.rating_id} id={String(a.activity_id)} title={a.title} rating={a.avg_rating ?? 0}
                                    location={a.location ?? ''} category={a.category as any}
                                    imageUrl={a.image_url}
                                    href={`/activities/${a.activity_id}`}
                                    isBookmarked={bookmarkedIds.has(String(a.activity_id))}
                                    variant="completed"
                                    userRating={entry.rating}
                                    className="w-full" />
                            )
                        })}
                    </div>
                )}

                {/* bookmarks */}
                {tab === 'bookmarks' && (bookmarks.length === 0
                    ? <p className="text-[#a0a3a8]">No bookmarks yet.</p>
                    : <div className="grid grid-cols-4 gap-[28px]">
                        {bookmarks.map((b) => {
                            const a = toActivity(b.activities)
                            if (!a) return null
                            return (
                                <ActivityCard key={b.activity_id} id={String(a.activity_id)} title={a.title} rating={a.avg_rating ?? 0}
                                    location={a.location ?? ''} category={a.category as any}
                                    imageUrl={a.image_url}
                                    href={`/activities/${a.activity_id}`}
                                    isBookmarked={true}
                                    className="w-full" />
                            )
                        })}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    )
}
