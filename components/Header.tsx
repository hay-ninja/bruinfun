'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Search, CircleUserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ActivitySearchResult = {
  activity_id: number | string
  title: string
  location: string | null
}

type HeaderProps = {
  onLogActivity?: () => void
}

export default function Header({ onLogActivity }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<ActivitySearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const query = searchQuery.trim()

    if (query.length < 2) {
      setResults([])
      setSearched(false)
      setSearching(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setSearching(true)

      try {
        const res = await fetch(`/api/activities?search=${encodeURIComponent(query)}`)
        const json = (await res.json()) as { data?: ActivitySearchResult[] }

        if (!res.ok) {
          setResults([])
          setSearched(true)
          return
        }

        setResults(json.data ?? [])
        setSearched(true)
      } catch {
        setResults([])
        setSearched(true)
      } finally {
        setSearching(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowDropdown(true)
  }

  const shouldShowDropdown = showDropdown && searchQuery.trim().length >= 2

  return (
    // frosted glass from figma, sticky so it stays up top
    <header className="w-full backdrop-blur-[3px] bg-[rgba(248,248,248,0.95)] border-b border-[#e0e0e0] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.05)] px-[76px] py-[22px] flex items-center sticky top-0 z-50">

      {/* logo, flex-1 so search bar ends up centered */}
      <div className="flex-1">
        {/* gradient clipped to text */}
        <span
          className="font-[family-name:var(--font-nunito)] text-[29px] font-semibold tracking-[-0.58px] bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgb(102,180,218) 0%, rgb(153,222,255) 100%)',
          }}
        >
          BruinFun
        </span>
      </div>

      {/* search bar, fixed width between the two flex-1 sides */}
      <div ref={wrapperRef} className="relative w-[445px]">
        <form
          onSubmit={handleSearch}
          className="bg-[rgba(255,255,255,0.3)] rounded-full shadow-[0px_1.5px_15px_-0.75px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center justify-between pl-[19px] pr-[9px] py-[6px]">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setShowDropdown(true)
              }}
              placeholder="What sounds fun right now?"
              className="flex-1 bg-transparent text-[17px] font-normal text-black placeholder:text-[rgba(0,0,0,0.3)] outline-none"
            />
            {/* search button */}
            <button
              aria-label="Search"
              className="w-[31px] h-[31px] bg-[#1f93cd] rounded-full flex items-center justify-center shrink-0"
            >
              <Search size={14} strokeWidth={2.5} className="text-[#eaf4fa]" />
            </button>
          </div>
        </form>

        {shouldShowDropdown ? (
          <div className="absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#dfe4e8] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] z-50">
            {searching ? (
              <p className="px-4 py-3 text-sm text-[#4f5965]">Searching...</p>
            ) : null}

            {!searching && searched && results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#4f5965]">No activities found</p>
            ) : null}

            {!searching && results.length > 0 ? (
              <ul className="py-1">
                {results.map((activity) => (
                  <li key={activity.activity_id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setShowDropdown(false)
                        router.push(`/activities/${activity.activity_id}`)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#f4f8fb]"
                    >
                      <span className="block text-sm font-semibold text-[#1d2733]">{activity.title}</span>
                      <span className="block text-xs text-[#6d7783]">{activity.location ?? 'Location unavailable'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* right side actions, flex-1 to balance the logo side */}
      <div className="flex-1 flex items-center justify-end gap-[14px]">
        <button
          type="button"
          onClick={() => onLogActivity?.()}
          className="bg-[#1f93cd] text-[#eaf4fa] text-[16px] font-medium px-[16px] py-[10px] rounded-full leading-none"
        >
          Log Activity
        </button>
        {/* profile icon — links to own profile page */}
        <Link href="/profile"
          aria-label="Profile"
          className="w-[40px] h-[40px] bg-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center"
        >
          <CircleUserRound size={20} className="text-[rgba(0,0,0,0.3)]" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  )
}
