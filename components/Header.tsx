'use client'

import { Search, CircleUserRound } from 'lucide-react'

export default function Header() {
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
      <div className="bg-[rgba(255,255,255,0.3)] rounded-full shadow-[0px_1.5px_15px_-0.75px_rgba(0,0,0,0.1)] w-[445px]">
        <div className="flex items-center justify-between pl-[19px] pr-[9px] py-[6px]">
          <input
            type="text"
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
      </div>

      {/* right side actions, flex-1 to balance the logo side */}
      <div className="flex-1 flex items-center justify-end gap-[14px]">
        <button className="bg-[#1f93cd] text-[#eaf4fa] text-[16px] font-medium px-[16px] py-[10px] rounded-full leading-none">
          Log Activity
        </button>
        {/* profile icon */}
        <button
          aria-label="Profile"
          className="w-[40px] h-[40px] bg-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center"
        >
          <CircleUserRound size={20} className="text-[rgba(0,0,0,0.3)]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
