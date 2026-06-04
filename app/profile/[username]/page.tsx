'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/activity/activity-card'

type Tab = 'posted' | 'completed'

type Activity = {
    activity_id: number
    title: string
    category: string | null
    image_url: string | null
    location: string | null
    avg_rating: number | null
}

type CompletedEntry = {
    rating_id: number
    rating: number
    activities: Activity | Activity[] | null
}

type ProfileData = {
    profile: { username: string; first_name: string; last_name: string }
    posted: Activity[]
    completed: CompletedEntry[]
}

// Supabase joined relations can come back as a single object or an array
function toActivity(raw: Activity | Activity[] | null): Activity | null {
    if (!raw) return null
    return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

export default function PublicProfilePage() {
    const { username } = useParams<{ username: string }>()
    const [tab, setTab] = useState<Tab>('posted')
    const [data, setData] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!username) return
        fetch(`/api/users/${username}`).then(async (res) => {
            if (res.status === 404) {
                setError('user not found')
                setLoading(false)
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
    }, [username])

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

    const { profile, posted, completed } = data
    const tabs: Tab[] = ['posted', 'completed'] // no bookmarks on public view

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="px-[90px] py-[48px] flex flex-col gap-[32px]">

                <div className="flex flex-col gap-[4px]">
                    <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20]">
                        {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-[#a0a3a8] text-[15px]">@{profile.username}</p>
                </div>

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

                {tab === 'posted' && (posted.length === 0
                    ? <p className="text-[#a0a3a8]">No activities posted yet.</p>
                    : <div className="flex flex-wrap gap-[20px]">
                        {posted.map((a) => (
                            <ActivityCard key={a.activity_id} title={a.title} rating={a.avg_rating ?? 0}
                                location={a.location ?? ''} category={a.category as any}
                                imageUrl={a.image_url ?? `https://picsum.photos/seed/${a.activity_id}/400/300`}
                                href={`/activities/${a.activity_id}`} />
                        ))}
                    </div>
                )}

                {tab === 'completed' && (completed.length === 0
                    ? <p className="text-[#a0a3a8]">No completed activities yet.</p>
                    : <div className="flex flex-col gap-[16px]">
                        {completed.map((entry) => {
                            const a = toActivity(entry.activities)
                            if (!a) return null
                            return (
                                <div key={entry.rating_id} className="flex gap-[16px] items-start">
                                    <ActivityCard title={a.title} rating={entry.rating}
                                        location={a.location ?? ''} category={a.category as any}
                                        imageUrl={a.image_url ?? `https://picsum.photos/seed/${a.activity_id}/400/300`}
                                        href={`/activities/${a.activity_id}`} />
                                    <p className="text-[15px] font-medium text-[#191c20] pt-[8px]">{entry.rating} ★</p>
                                </div>
                            )
                        })}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    )
}
