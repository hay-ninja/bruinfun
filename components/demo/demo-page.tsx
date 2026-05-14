import Sidebar from "@/components/demo/sidebar";
import CategoryTabs from "@/components/demo/category-tabs";
import FilterPills from "@/components/demo/filter-pills";
import ActivitySection from "@/components/demo/activity-section";

const CARD_IMG = "https://www.figma.com/api/mcp/asset/e0bd84c2-0c87-489e-935c-95d8222dd386";

const sections = [
  {
    title: "Accessories",
    cards: Array.from({ length: 5 }, () => ({
      title: "Sunset Rec Lounging",
      rating: "4.6",
      desc: "Short description describing something or other",
      imgUrl: CARD_IMG,
    })),
  },
  {
    title: "Popular Near You",
    cards: Array.from({ length: 5 }, () => ({
      title: "Ocean Breeze Hat",
      rating: "4.8",
      desc: "Stylish sun protection for your beach days",
      imgUrl: CARD_IMG,
    })),
  },
  {
    title: "New This Week",
    cards: Array.from({ length: 5 }, () => ({
      title: "Ocean Breeze Hat",
      rating: "4.8",
      desc: "Stylish sun protection for your beach days",
      imgUrl: CARD_IMG,
    })),
  },
];

export default function DemoPage() {
  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans">
      <Sidebar />
      <main className="ml-32 px-12 pt-[62px] pb-20 flex-1 max-w-[1160px]">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[36px] font-semibold tracking-[-0.36px] text-black">
            Browse Activities
          </h1>
          <div className="flex items-center gap-2 bg-[rgba(120,120,120,0.10)] rounded-full py-[10px] px-[18px] w-56 text-[#949494] text-base cursor-text">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#949494" strokeWidth="1.5" />
              <path d="M10.5 10.5L13.5 13.5" stroke="#949494" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Search</span>
          </div>
        </div>

        <CategoryTabs />
        <FilterPills />

        {sections.map((section, i) => (
          <ActivitySection key={i} title={section.title} cards={section.cards} />
        ))}
      </main>
    </div>
  );
}
