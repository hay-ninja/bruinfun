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
    category: string
    image_url: string | null
    location: string | null
}

type ProfileData = {
    profile: { username: string; first_name: string; last_name: string }
    posted: Activity[]
    completed: { rating_id: number; rating: number; activities: Activity }[]
    bookmarks: { activity_id: number; activities: Activity }[]
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
    const tabs: Tab[] = ['posted', 'completed', 'bookmarks']

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="px-[90px] py-[48px] flex flex-col gap-[32px]">

                {/* name + username */}
                <div className="flex flex-col gap-[4px]">
                    <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20]">
                        {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-[#a0a3a8] text-[15px]">@{profile.username}</p>
                </div>

                {/* tab switcher */}
                <div className="flex gap-[8px] border-b border-[#e0e0e0]">
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
                    : <div className="flex flex-wrap gap-[20px]">
                        {posted.map((a) => (
                            <ActivityCard key={a.activity_id} title={a.title} rating={0}
                                location={a.location ?? ''} category={a.category as any}
                                imageUrl={a.image_url ?? `https://picsum.photos/seed/${a.activity_id}/400/300`} />
                        ))}
                    </div>
                )}

                {/* completed - show rating next to card */}
                {tab === 'completed' && (completed.length === 0
                    ? <p className="text-[#a0a3a8]">No completed activities yet.</p>
                    : <div className="flex flex-col gap-[16px]">
                        {completed.map((entry) => (
                            <div key={entry.rating_id} className="flex gap-[16px] items-start">
                                <ActivityCard title={entry.activities.title} rating={entry.rating}
                                    location={entry.activities.location ?? ''} category={entry.activities.category as any}
                                    imageUrl={entry.activities.image_url ?? `https://picsum.photos/seed/${entry.activities.activity_id}/400/300`} />
                                <div className="flex flex-col gap-[4px] pt-[8px]">
                                    <p className="text-[15px] font-medium text-[#191c20]">Your rating: {entry.rating} ★</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* bookmarks */}
                {tab === 'bookmarks' && (bookmarks.length === 0
                    ? <p className="text-[#a0a3a8]">No bookmarks yet.</p>
                    : <div className="flex flex-wrap gap-[20px]">
                        {bookmarks.map((b) => (
                            <ActivityCard key={b.activity_id} title={b.activities.title} rating={0}
                                location={b.activities.location ?? ''} category={b.activities.category as any}
                                imageUrl={b.activities.image_url ?? `https://picsum.photos/seed/${b.activity_id}/400/300`}
                                isBookmarked={true} />
                        ))}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    )
}
