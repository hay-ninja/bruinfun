'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? 'Signup failed')
            setLoading(false)
            return
        }

        router.push('/')
    }

    return (
        <main className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <h1 className="text-2xl font-bold">Sign up</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="border rounded px-3 py-2"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
                >
                    {loading ? 'Signing up...' : 'Sign up'}
                </button>

                <p className="text-sm text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">Log in</Link>
                </p>
            </form>
        </main>
    )
}
