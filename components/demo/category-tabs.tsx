"use client";

import { useState } from "react";

const TABS = ["Accessories", "Tops", "Shoes", "Something", "New"];

export default function CategoryTabs() {
  const [active, setActive] = useState("Accessories");

  return (
    <div className="mb-3">
      <div className="flex gap-[52px] items-center pl-[10px] text-[18px] font-medium tracking-[-0.72px]">
        {TABS.map((tab) => (
          <span
            key={tab}
            onClick={() => setActive(tab)}
            className={`cursor-pointer pb-[10px] relative ${
              active === tab
                ? "opacity-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-black after:rounded-sm"
                : "opacity-40"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="h-px bg-[#e0e0e0]" />
    </div>
  );
}
