'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/activity/activity-card'
import LogActivityModal from '@/components/LogActivityModal'

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
    const [menuOpen, setMenuOpen] = useState(false)
    const [logModalOpen, setLogModalOpen] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordActionError, setPasswordActionError] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        function onClickOutside(event: MouseEvent) {
            if (!menuRef.current) return
            if (!menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

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

    async function handleChangePasswordSubmit(e: React.FormEvent) {
        e.preventDefault()
        setPasswordActionError('')

        if (newPassword.length < 8) {
            setPasswordActionError('New password must be at least 8 characters.')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordActionError('New password and confirmation do not match.')
            return
        }

        setPasswordSaving(true)
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        })

        const json = await res.json().catch(() => ({} as { error?: string }))
        if (!res.ok) {
            setPasswordActionError(json.error ?? 'Could not update password')
            setPasswordSaving(false)
            return
        }

        setPasswordSaving(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowChangePassword(false)
    }

    const bookmarkedIds = new Set(bookmarks.map((b) => String(b.activity_id)))
    const tabs: Tab[] = ['posted', 'completed', 'bookmarks']

    return (
        <div className="min-h-screen bg-white">
            <Header onLogActivity={() => setLogModalOpen(true)} />
            <main className="px-[90px] py-[48px] flex flex-col gap-[32px]">

                {/* name + username */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[4px]">
                        <h1 className="font-[family-name:var(--font-nunito)] text-[28px] font-semibold text-[#191c20]">
                            {profile.first_name} {profile.last_name}
                        </h1>
                        <p className="text-[#a0a3a8] text-[15px]">@{profile.username}</p>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            aria-label="Profile actions"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="h-[36px] w-[36px] rounded-full border border-[#e0e0e0] text-[18px] leading-none text-[#6d7783] hover:border-[#191c20] hover:text-[#191c20]"
                        >
                            ...
                        </button>

                        {menuOpen ? (
                            <div className="absolute right-0 mt-2 w-[170px] rounded-[12px] border border-[#e0e0e0] bg-white py-1 shadow-[0_8px_20px_rgba(0,0,0,0.12)] z-20">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false)
                                        setPasswordActionError('')
                                        setShowChangePassword(true)
                                    }}
                                    className="w-full px-4 py-2 text-left text-[14px] text-[#191c20] hover:bg-[#f5f8fb]"
                                >
                                    Change password
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-[14px] text-[#191c20] hover:bg-[#f5f8fb]"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : null}
                    </div>
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

            {showChangePassword ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                    <div className="w-full max-w-[420px] rounded-[18px] border border-[#d8dfe6] bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
                        <h2 className="text-[20px] font-semibold text-[#191c20]">Change password</h2>
                        <p className="mt-1 text-[13px] text-[#6d7783]">Use your current password to set a new one.</p>

                        <form onSubmit={handleChangePasswordSubmit} className="mt-5 flex flex-col gap-3">
                            <input
                                type="password"
                                placeholder="Current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2 text-[14px] outline-none focus:border-[#1f93cd]"
                            />
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2 text-[14px] outline-none focus:border-[#1f93cd]"
                            />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2 text-[14px] outline-none focus:border-[#1f93cd]"
                            />

                            {passwordActionError ? (
                                <p className="text-[13px] text-red-500">{passwordActionError}</p>
                            ) : null}

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowChangePassword(false)
                                        setPasswordActionError('')
                                    }}
                                    className="rounded-[10px] border border-[#d9d9d9] px-4 py-2 text-[14px] text-[#4f5965]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="rounded-[10px] bg-[#1f93cd] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-60"
                                >
                                    {passwordSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}

            <Footer />

            {logModalOpen && (
                <LogActivityModal
                    initialQuery=""
                    onClose={() => setLogModalOpen(false)}
                    onLogged={() => setLogModalOpen(false)}
                />
            )}
        </div>
    )
}
