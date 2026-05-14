
//damn kai u did alot, i think this would lowk be deleted
export default function Sidebar() {
  return (
    <nav className="fixed left-8 top-1/2 -translate-y-1/2 w-[63px] bg-[#ebebeb] rounded-[30px] py-2 px-[6px] flex flex-col gap-4 shadow-[3px_4px_15px_rgba(0,0,0,0.10)] z-10">
      {/* Feed — active */}
      <div className="h-[51px] rounded-full flex items-center justify-center cursor-pointer bg-[#3973dc] text-white transition-colors duration-150">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="12" width="5" height="9" rx="1.5" fill="currentColor" />
          <rect x="8.5" y="7" width="5" height="14" rx="1.5" fill="currentColor" />
          <rect x="16" y="2" width="5" height="19" rx="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Map */}
      <div className="h-[51px] rounded-full flex items-center justify-center cursor-pointer text-[#a7a7a7] transition-colors duration-150">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M8 2L2 5v14l6-3 6 3 6-3V2l-6 3-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 2v14M14 5v14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Profile avatar placeholder */}
      <div className="h-[51px] rounded-full flex items-center justify-center cursor-pointer">
        <div className="w-[38px] h-[38px] rounded-full bg-[#d0d0d0]" />
      </div>
    </nav>
  );
}
