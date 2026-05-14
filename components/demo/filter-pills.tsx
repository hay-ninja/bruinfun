"use client";

import { useState } from "react";

//hard coded from kais demo again..
const PILLS = [
  { label: "All Activities", emoji: null, color: null },
  { label: "Product", emoji: "🛍", color: "#ff2c55" },
  { label: "Restaurant", emoji: "🍴", color: "#ff9502" },
  { label: "Place", emoji: "📍", color: "#007aff" },
  { label: "Service", emoji: "✦", color: "#4bb430" },
  { label: "Event", emoji: "🎫", color: "#af3ccc" },
];

//From Kai's initial index.html for demo website - subject to change week 7
export default function FilterPills() {
  const [active, setActive] = useState("All Activities");

  return (
    <div className="flex gap-2 items-center flex-wrap my-3 mb-6">
      {PILLS.map(({ label, emoji, color }) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          className={`flex items-center gap-[5px] py-[8.6px] pr-[17.2px] pl-[14.3px] rounded-full text-[14.3px] font-semibold cursor-pointer border-none whitespace-nowrap transition-colors ${
            active === label
              ? "bg-black text-white"
              : "bg-[#ebebeb] text-[#323232]"
          }`}
        >
          {emoji && <span style={{ color: color ?? undefined }}>{emoji}</span>}
          {label}
        </button>
      ))}
    </div>
  );
}
