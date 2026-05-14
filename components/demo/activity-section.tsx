import ActivityCard from "@/components/demo/activity-card";

interface Card {
  title: string;
  rating: string;
  desc: string;
  imgUrl: string;
}

interface ActivitySectionProps {
  title: string;
  cards: Card[];
}

//From Kai's initial index.html for demo website - subject to change week 7

export default function ActivitySection({ title, cards }: ActivitySectionProps) {
  return (
    <div className="mb-6">
      <div className="text-[18px] font-medium tracking-[-0.72px] text-black mb-2">{title}</div>
      {/* Fade-out gradient on right edge */}
      <div className="relative overflow-hidden after:absolute after:right-0 after:top-0 after:w-[83px] after:h-full after:bg-gradient-to-r after:from-transparent after:via-[rgba(250,250,250,0.8)] after:to-[#fafafa] after:pointer-events-none">
        <div className="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {cards.map((card, i) => (
            <ActivityCard key={i} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
