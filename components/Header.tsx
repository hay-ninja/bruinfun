'use client'

import { Search, CircleUserRound } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full backdrop-blur-[3px] bg-[rgba(248,248,248,0.95)] border-b border-[#e0e0e0] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.05)] px-[85px] py-[24px] flex items-center sticky top-0 z-50">
      {/* Logo - flex-1 left anchor */}
      <div className="flex-1">
        <span
          className="font-[family-name:var(--font-nunito)] text-[32px] font-semibold tracking-[-0.64px] bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgb(102,180,218) 0%, rgb(153,222,255) 100%)',
          }}
        >
          BruinFun
        </span>
      </div>

      {/* Search - fixed width actually centered */}
      <div className="bg-[rgba(255,255,255,0.3)] rounded-full shadow-[0px_1.5px_15px_-0.75px_rgba(0,0,0,0.1)] w-[495px]">
        <div className="flex items-center justify-between pl-[21px] pr-[10px] py-[7px]">
          <input
            type="text"
            placeholder="What sounds fun right now?"
            className="flex-1 bg-transparent text-[19px] font-normal text-black placeholder:text-[rgba(0,0,0,0.3)] outline-none"
          />
          <button
            aria-label="Search"
            className="w-[34px] h-[34px] bg-[#1f93cd] rounded-full flex items-center justify-center shrink-0"
          >
            <Search size={15} strokeWidth={2.5} className="text-[#eaf4fa]" />
          </button>
        </div>
      </div>

      {/* Actions — flex-1 right anchor */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <button className="bg-[#1f93cd] text-[#eaf4fa] text-[18px] font-medium px-[18px] py-[11px] rounded-full leading-none">
          Log Activity
        </button>
        <button
          aria-label="Profile"
          className="w-[44px] h-[44px] bg-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center"
        >
          <CircleUserRound size={22} className="text-[rgba(0,0,0,0.3)]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
