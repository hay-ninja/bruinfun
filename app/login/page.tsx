'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? 'Login failed')
            setLoading(false)
            return
        }

        router.push('/')
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-[#fafafa]">
            <div className="bg-[rgba(235,235,235,0.17)] border border-[rgba(199,199,199,0.33)] rounded-[36px] px-6 py-9 flex flex-col gap-9 items-center w-[362px]">
                <Image
                    src="/header/BruinFun.png"
                    width={128}
                    height={80}
                    alt="BruinFun Home"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                    <div className="border-b border-black/10 w-full">
                        <div className="flex items-center gap-14 pl-4">
                            <span className="-mb-px pb-3 text-[16px] font-medium tracking-[-0.72px] text-black border-b-2 border-black">
                                Log In
                            </span>
                            <Link href="/signup" className="pb-3 text-[16px] font-medium tracking-[-0.72px] text-black/40">
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full bg-[rgba(120,120,120,0.1)] rounded-full px-4 py-3 text-[16px] text-black placeholder-[#949494] outline-none border-0"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full bg-[rgba(120,120,120,0.1)] rounded-full px-4 py-3 text-[16px] text-black placeholder-[#949494] outline-none border-0"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1f93cd] text-[#eaf4fa] rounded-full py-3 text-[18px] font-medium tracking-[-0.72px] disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
            </div>
        </main>
    )
}
