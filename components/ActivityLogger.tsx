"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogActivityModal from "@/components/LogActivityModal";

export default function ActivityLogger() {
  const [open, setOpen] = useState(false);
  const [homepageSearch, setHomepageSearch] = useState("");
  const [initialModalQuery, setInitialModalQuery] = useState("");

  function openLogger(query = "") {
    setInitialModalQuery(query.trim());
    setOpen(true);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#bde6ea] text-[#5b5a54]">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute -left-28 top-32 h-28 w-96 rounded-full bg-[#ffe1cf]/85 blur-[1px]" />
        <div className="absolute -right-24 top-28 h-28 w-96 rounded-full bg-[#ffe1cf]/85 blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#f4cfc0]" />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <p className="text-sm font-bold uppercase text-[#ffffff]/90">BruinFun</p>
          <Button
            onClick={() => openLogger()}
            className="rounded-full bg-[#58a9c7] px-5 text-white shadow-md shadow-[#4795b0]/30 hover:bg-[#438ead]"
          >
            <Plus />
            Log
          </Button>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-36 pt-14 sm:px-8">
          <h1 className="text-center text-5xl font-black uppercase leading-none tracking-normal text-[#fff2df] drop-shadow-[0_5px_0_rgba(214,168,137,0.55)] sm:text-7xl lg:text-8xl">
            Bruin Fun
          </h1>

          <form
            className="mt-8 flex h-12 w-full max-w-md items-center rounded-full bg-[#f7f0df]/85 pl-5 pr-1 shadow-md shadow-[#83c6d1]/40"
            onSubmit={(event) => {
              event.preventDefault();
              openLogger(homepageSearch);
            }}
          >
            <input
              value={homepageSearch}
              onChange={(event) => setHomepageSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#5b5a54] outline-none placeholder:text-[#9a968b]"
              placeholder="Search here"
            />
            <button
              type="submit"
              className="inline-flex size-10 items-center justify-center rounded-full bg-[#58a9c7] text-white shadow-sm hover:bg-[#438ead]"
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>
          </form>

          <div className="mt-12 w-full max-w-lg rounded-2xl bg-[#f7f0df]/70 px-5 py-4 text-center text-sm font-medium text-[#6d655b] shadow-md shadow-[#83c6d1]/30">
            Search for an activity to log, or use the Log button to start from scratch.
          </div>
        </div>
      </section>

      {open ? (
        <LogActivityModal
          initialQuery={initialModalQuery}
          onClose={() => setOpen(false)}
          onLogged={() => setOpen(false)}
        />
      ) : null}
    </main>
  );
}
