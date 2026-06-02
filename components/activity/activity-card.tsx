// individual card! thanks kai for design so clutch
import { MapPin, Users, Utensils, Tag, Zap, Calendar } from 'lucide-react'
import Link from 'next/link'

type Category = 'Restaurant' | 'Place' | 'Service' | 'Product' | 'Event'

type ActivityCardProps = {
  title: string
  rating: number
  location: string
  imageUrl: string
  href?: string
  category?: Category
  attendeeCount?: number
  tags?: string[]
  isBookmarked?: boolean
  className?: string
  onClick?: () => void
}

// badge color per category, pulled directly from figma thx kai :D
const CATEGORY_COLORS: Record<Category, string> = {
  Restaurant: '#ff9502',
  Place:      '#007aff',
  Service:    '#4bb430',
  Product:    '#ff2c55',
  Event:      '#a855f7',
}

// tentative icon per category for the badge from lucide
const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Restaurant: <Utensils size={10} strokeWidth={2.5} />,
  Place:      <MapPin   size={10} strokeWidth={2.5} />,
  Service:    <Zap      size={10} strokeWidth={2.5} />,
  Product:    <Tag      size={10} strokeWidth={2.5} />,
  Event:      <Calendar size={10} strokeWidth={2.5} />,
}

export default function ActivityCard({
  title,
  rating,
  location,
  imageUrl,
  href,
  category,
  attendeeCount,
  tags = [],
  isBookmarked = false,
  className = '',
  onClick,
}: ActivityCardProps) {
  // grab the right color + icon for the badge
  const badgeColor = category ? CATEGORY_COLORS[category] : '#007aff'
  const badgeIcon  = category ? CATEGORY_ICONS[category]  : null
  const hoverClass = href
    ? 'transition-transform duration-200 will-change-transform hover:-translate-y-[2px] hover:shadow-[0px_8px_22px_-8px_rgba(0,0,0,0.35)]'
    : ''

  const card = (
    <div className={`flex-shrink-0 w-[266px] flex flex-col rounded-[24px] overflow-hidden bg-[rgba(255,255,255,0.3)] border border-[rgba(192,199,209,0.6)] shadow-[0px_1.68px_16.78px_-1px_rgba(0,0,0,0.2)] ${hoverClass} ${className}`}>

      {/* photo with badge + bookmark overlaid */}
      <div className="relative h-[163px] overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />

        {/* category badge top left */}
        {category && (
          <div
            className="absolute top-[16px] left-[15px] flex items-center gap-[3.5px] text-white px-[9px] py-[4.5px] rounded-full shadow-[0px_1.68px_1.68px_0px_rgba(0,0,0,0.05)]"
            style={{ backgroundColor: badgeColor }}
          >
            {badgeIcon}
            <span className="text-[11.5px] font-semibold leading-none">{category}</span>
          </div>
        )}

        {/* custom bookmark svg from figma, not a lucide icon */}
        <div className="absolute top-[18px] right-[18px] drop-shadow-[0px_1.4px_1.4px_rgba(0,0,0,0.1)]">
          <svg width="14" height="19" viewBox="0 0 14 19" fill={isBookmarked ? 'white' : 'rgba(0,0,0,0.2)'} xmlns="http://www.w3.org/2000/svg">
            <path d="M0 19V2C0 0.9 0.9 0 2 0H12C13.1 0 14 0.9 14 2V19L7 16L0 19Z" />
          </svg>
        </div>
      </div>

      {/* everything below the photo */}
      <div className="flex flex-col gap-[6.7px] pt-[8.4px] pb-[13.4px] px-[14.2px]">

        {/* title and rating */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-nunito)] text-[15px] font-semibold text-[#191c20] overflow-hidden text-ellipsis whitespace-nowrap leading-[1.49]">
              {title}
            </span>
            <div className="flex items-center gap-[1.7px] shrink-0 ml-2">
              <span className="text-[15px] font-medium text-black">{rating}</span>
              <span className="text-[#edb721] text-[13px]">★</span>
            </div>
          </div>

          {/* location */}
          <div className="flex items-center gap-[2.5px] h-[22px]">
            <MapPin size={11} className="text-[#a0a3a8] shrink-0" />
            <span className="text-[12.7px] text-[#a0a3a8] overflow-hidden text-ellipsis whitespace-nowrap">
              {location}
            </span>
          </div>
        </div>

        {/* attendees + tags, skipped if both are empty */}
        {(attendeeCount !== undefined || tags.length > 0) && (
          <div className="flex items-center gap-[6.7px]">
            {attendeeCount !== undefined && (
              <div className="flex items-center gap-[2.5px] text-[#a0a3a8] px-[4px]">
                <Users size={11} />
                <span className="text-[13.8px]">{attendeeCount}</span>
              </div>
            )}
            <div className="flex items-center gap-[3.4px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11.8px] font-semibold text-[#323232] bg-[rgba(255,255,255,0.8)] border border-[rgba(166, 166, 166, 0.8)] px-[9px] py-[4.5px] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (!href) return card

  return (
    <Link href={href} className="block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f93cd] focus-visible:ring-offset-2">
      {card}
    </Link>
  )
}
