"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import LogActivityModal from "@/components/LogActivityModal"

type Activity = {
  activity_id: number | string
  title: string
  description: string | null
  category: string | null
  location: string | null
  event_date: string | null
  image_url: string | null
}

export default function CompleteActivityButton({
  activity,
  isLoggedIn,
  existingRating,
}: {
  activity: Activity
  isLoggedIn: boolean
  existingRating?: number | null
}) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [completedRating, setCompletedRating] = useState<number | null>(existingRating ?? null)

  if (completedRating != null) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#f0fdf4] px-4 py-2 text-[14px] font-semibold text-[#16a34a]">
        <CheckCircle2 className="size-4" />
        Completed — you rated {completedRating}/10
      </div>
    )
  }

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    setModalOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-full bg-[#1f93cd] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1a7fb3] active:scale-95"
      >
        <CheckCircle2 className="size-4" />
        I&apos;ve done this
      </button>

      {modalOpen && (
        <LogActivityModal
          preSelectedActivity={activity}
          onClose={() => setModalOpen(false)}
          onLogged={(rating) => {
            setCompletedRating(rating)
            setModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
