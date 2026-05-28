'use client'

import { Search, CircleUserRound } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full bg-white px-10 h-[68px] flex items-center gap-8">
      {/* Logo */}
      <span className="text-[#007AFF] text-[22px] font-extrabold tracking-tight shrink-0">
        BruinFun
      </span>

      {/* Search */}
      <div className="flex flex-1 items-center bg-[#F2F2F7] rounded-full px-5 py-2.5 gap-3 max-w-2xl">
        <input
          type="text"
          placeholder="What sounds fun right now?"
          className="flex-1 bg-transparent text-[15px] text-gray-800 placeholder:text-[#8E8E93] outline-none"
        />
        <button
          aria-label="Search"
          className="w-[34px] h-[34px] bg-[#007AFF] rounded-full flex items-center justify-center shrink-0"
        >
          <Search size={15} strokeWidth={2.5} className="text-white" />
        </button>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-3 shrink-0">
        <button className="bg-[#007AFF] text-white text-[15px] font-semibold px-5 py-2.5 rounded-full leading-none">
          Log Activity
        </button>
        <button aria-label="Profile">
          <CircleUserRound size={34} className="text-[#8E8E93]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
