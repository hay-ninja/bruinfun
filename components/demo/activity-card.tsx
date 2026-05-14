interface ActivityCardProps {
  title: string;
  rating: string;
  desc: string;
  imgUrl: string;
}

//From Kai's initial index.html for demo website - subject to change HEAVILY week 7

export default function ActivityCard({ title, rating, desc, imgUrl }: ActivityCardProps) {
  return (
    <div className="flex-shrink-0 w-[310px] flex flex-col gap-2 pt-2 pb-4 rounded-[28px] overflow-hidden">
      {/* Image */}
      <div className="relative h-[252px] rounded-[20px] overflow-hidden flex-shrink-0">
        <img src={imgUrl} alt={title} className="w-full h-full object-cover block" />
        {/* Bookmark */}
        <div className="absolute top-3 right-[13px] w-[34px] h-[34px] bg-white/80 rounded-full flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="px-1 flex flex-col gap-[6px]">
        <div className="flex items-center justify-between">
          <span className="text-[20px] font-medium tracking-[-0.8px] text-black">{title}</span>
          <div className="flex items-center gap-1 text-[#f0ac19] text-[20px] font-medium tracking-[-0.8px] whitespace-nowrap">
            <span>{rating}</span>
            <span className="text-[15px]">★</span>
          </div>
        </div>
        <div className="text-[14px] text-[#ababab] tracking-[-0.56px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[213px]">
          {desc}
        </div>
      </div>
    </div>
  );
}
