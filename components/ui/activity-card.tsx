import { MapPin, Bookmark, Users } from "lucide-react";

interface ActivityCardProps {
  title: string;
  rating: number;
  location: string;
  imageUrl: string;
  category?: string;
  attendeeCount?: number;
  tags?: string[];
  isBookmarked?: boolean;
}

export default function ActivityCard({
  title,
  rating,
  location,
  imageUrl,
  category = "Place",
  attendeeCount = 0,
  tags = [],
  isBookmarked = false,
}: ActivityCardProps) {
  return (
    <div className="flex-shrink-0 w-[283px] flex flex-col rounded-[24px] overflow-hidden bg-white/30 border border-[rgba(192,199,209,0.6)] shadow-[0px_2px_20px_-1px_rgba(0,0,0,0.2)]">

      {/* Image section */}
      <div className="relative h-[194px] overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />

        {/* Category badge */}
        {category && (
          <div className="absolute top-[19px] left-[18px] flex items-center gap-1 bg-[#007aff] text-white px-[10.8px] py-[5.4px] rounded-full shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)]">
            <MapPin size={12} strokeWidth={2.5} />
            <span className="text-[14px] font-semibold leading-none">{category}</span>
          </div>
        )}

        {/* Bookmark */}
        <div className="absolute top-[22px] right-[22px] drop-shadow-[0px_1.71px_1.71px_rgba(0,0,0,0.1)]">
          <Bookmark size={24} className="text-white" fill={isBookmarked ? "white" : "rgba(0,0,0,0.2)"} />
        </div>
      </div>

      {/* Content section */}
      <div className="flex flex-col gap-0 pt-[10px] pb-4 px-[17px]">
        {/* Row 1 & 2: title + rating + location (extra div for spacing purposes) */}
        <div className="flex flex-col gap-0 pt-[10px] pb-4">
            <div className="flex items-center justify-between gap-2">
            <span className="text-[18px] font-semibold text-[#191c20] overflow-hidden text-ellipsis whitespace-nowrap leading-[1.49]">
                {title}
            </span>
            <div className="flex items-center gap-1 shrink-0">
                <span className="text-[18px] font-semibold text-[#000]">{rating}</span>
                <span className="text-[18px] text-[#f0ac19]">★</span>
            </div>
            </div>

            <div className="flex items-center gap-[3px] h-[26px]">
            <MapPin size={13} className="text-[#a0a3a8] shrink-0" />
            <span className="text-[15px] text-[#a0a3a8] overflow-hidden text-ellipsis whitespace-nowrap">
                {location}
            </span>
            </div>
        </div>

        {/* Row 3: attendee count + tag pills */}
        {(attendeeCount !== undefined || tags.length > 0) && (
          <div className="flex items-center gap-2">
            {attendeeCount !== undefined && (
              <div className="flex items-center gap-[3px] text-[#a0a3a8]">
                <Users size={13} />
                <span className="text-[16px]">{attendeeCount}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[14px] font-semibold text-[#323232] bg-white/80 border border-[rgba(192,199,209,0.6)] px-[10.8px] py-[5.4px] rounded-full"
              >
                {tag}
              </span>
            ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
