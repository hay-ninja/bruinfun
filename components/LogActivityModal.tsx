"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Activity = {
  activity_id: number | string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  event_date: string | null;
  image_url: string | null;
};

type RatingResponse = {
  rating_id: number | string;
};

const categories = ["sports", "food", "arts", "nightlife", "outdoors"];

async function uploadToCloudinary(file: File) {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: data,
  });

  const json = (await res.json()) as { secure_url?: string; error?: string };

  if (!res.ok) {
    throw new Error(json.error || "Image upload failed.");
  }

  if (!json.secure_url) {
    throw new Error("Image upload did not return a URL.");
  }

  return json.secure_url;
}

function ratingColor(value: number) {
  if (value <= 3) return "#ef4444";
  if (value <= 6) return "#f59e0b";
  return "#22c55e";
}

export default function LogActivityModal({
  initialQuery = "",
  preSelectedActivity,
  onClose,
  onLogged,
}: {
  initialQuery?: string;
  preSelectedActivity?: Activity;
  onClose: () => void;
  onLogged: (rating: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(preSelectedActivity ?? null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [newTitle, setNewTitle] = useState(initialQuery);
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [newLocation, setNewLocation] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [logPhoto, setLogPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (preSelectedActivity || selectedActivity) return;

    const query = searchQuery.trim();
    if (query.length < 2) return;

    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError("");

      try {
        const res = await fetch(`/api/activities?search=${encodeURIComponent(query)}`);
        const json = (await res.json()) as { data?: Activity[]; error?: string };

        if (!res.ok) throw new Error(json.error || "Could not search activities.");

        setResults(json.data ?? []);
        setSearched(true);
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : "Could not search activities.");
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery, selectedActivity, preSelectedActivity]);

  async function createActivityIfNeeded() {
    if (selectedActivity) return selectedActivity;

    const imageUrl = newPhoto ? await uploadToCloudinary(newPhoto) : null;
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        location: newLocation,
        image_url: imageUrl,
      }),
    });
    const json = (await res.json()) as Activity | { error?: string };

    if (!res.ok) throw new Error("error" in json ? json.error : "Could not create activity.");

    return json as Activity;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const activity = await createActivityIfNeeded();
      const ratingRes = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: activity.activity_id, rating }),
      });
      const ratingJson = (await ratingRes.json()) as RatingResponse | { error?: string };

      if (!ratingRes.ok) {
        throw new Error("error" in ratingJson ? ratingJson.error : "Could not save rating.");
      }

      const logPhotoUrl = selectedActivity && logPhoto ? await uploadToCloudinary(logPhoto) : null;
      const commentBody = [comment.trim(), logPhotoUrl ? `Photo: ${logPhotoUrl}` : ""]
        .filter(Boolean)
        .join("\n");

      if (commentBody) {
        const commentRes = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_id: activity.activity_id,
            rating_id: (ratingJson as RatingResponse).rating_id,
            comment: commentBody,
          }),
        });
        const commentJson = (await commentRes.json()) as { error?: string };

        if (!commentRes.ok) throw new Error(commentJson.error || "Could not save comment.");
      }

      onLogged(rating);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not log activity.");
    } finally {
      setSaving(false);
    }
  }

  const [show, setShow] = useState(false)

  const handleClose = useCallback(() => {
    setShow(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    setShow(true)
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [handleClose])

  const needsCreate = !selectedActivity && searched && results.length === 0 && searchQuery.trim().length >= 2;
  const isCreatingNewActivity = needsCreate && !selectedActivity;
  const canLog = Boolean(preSelectedActivity) || Boolean(selectedActivity) || needsCreate;

  const fill = ((rating - 1) / 9) * 100;
  const color = ratingColor(rating);

  const inputCls = "h-10 w-full rounded-xl border border-[rgba(192,199,209,0.8)] bg-white px-3 text-[14px] text-[#323232] outline-none placeholder:text-[#b0b8c1] focus:border-[#1f93cd] focus:ring-2 focus:ring-[#1f93cd]/20";
  const sectionCls = "grid gap-3 rounded-2xl border border-[rgba(192,199,209,0.6)] bg-[#f8fafc] p-4";
  const labelCls = "text-[13px] font-semibold text-[#6d7783] uppercase tracking-wide";

  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={handleClose}
    >
      <div className="bg-white rounded-[50px] w-[950px] max-w-[95vw] h-[600] max-h-[90vh] overflow-y-auto transition-all duration-200 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(192,199,209,0.5)] px-8 pt-5 pb-4 sticky top-0 bg-white z-50">
          <div>
            <h2 className="font-[family-name:var(--font-nunito)] text-[20px] font-semibold text-[#191c20]">
              {preSelectedActivity ? "Complete Activity" : "Log Activity"}
            </h2>
            {preSelectedActivity && (
              <p className="mt-0.5 text-[13px] text-[#6d7783]">{preSelectedActivity.title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-9 items-center justify-center rounded-full text-[#6d7783] hover:bg-[#f0f4f8] hover:text-[#191c20]"
          >
            <X className="size-5" />
          </button>
        </div>

        <form id="log-activity-form" onSubmit={handleSubmit} className="grid gap-4 px-6 py-5">

          {/* Search / selected activity (hidden when pre-selected) */}
          {!preSelectedActivity && (
            <div className={sectionCls}>
              <p className={labelCls}>Activity</p>

              {selectedActivity ? (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-[rgba(192,199,209,0.6)] bg-white px-4 py-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[#191c20]">{selectedActivity.title}</p>
                    <p className="text-[13px] text-[#6d7783]">{selectedActivity.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="shrink-0 rounded-lg px-2 py-1 text-[13px] font-medium text-[#1f93cd] hover:bg-[#eef6fb]"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#b0b8c1]" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => {
                        const q = event.target.value;
                        setSearchQuery(q);
                        setNewTitle(q.trim());
                        if (q.trim().length < 2) {
                          setResults([]);
                          setSearched(false);
                        }
                      }}
                      placeholder="Search activities…"
                      className={`${inputCls} pl-9`}
                    />
                  </label>

                  {searching && (
                    <div className="flex items-center gap-2 text-[13px] text-[#6d7783]">
                      <Loader2 className="size-4 animate-spin" />
                      Searching…
                    </div>
                  )}

                  {results.length > 0 && (
                    <div className="grid gap-1.5">
                      {results.map((activity) => (
                        <button
                          type="button"
                          key={activity.activity_id}
                          onClick={() => setSelectedActivity(activity)}
                          className="rounded-xl border border-[rgba(192,199,209,0.6)] bg-white px-4 py-3 text-left hover:border-[#1f93cd] hover:bg-[#eef6fb]"
                        >
                          <span className="block text-[14px] font-semibold text-[#191c20]">{activity.title}</span>
                          <span className="block text-[13px] text-[#6d7783]">{activity.location}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {needsCreate && (
                <div className="grid gap-3 rounded-xl border border-[rgba(192,199,209,0.6)] bg-white p-4">
                  <p className="text-[13px] font-semibold text-[#6d7783]">
                    No match found — create a new activity?
                  </p>
                  <p className="rounded-lg border border-[rgba(192,199,209,0.6)] bg-[#f8fafc] px-3 py-2 text-[14px] font-semibold text-[#191c20]">
                    {newTitle}
                  </p>
                  <textarea
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description"
                    className="min-h-20 resize-y rounded-xl border border-[rgba(192,199,209,0.8)] bg-white px-3 py-2.5 text-[14px] text-[#323232] outline-none placeholder:text-[#b0b8c1] focus:border-[#1f93cd] focus:ring-2 focus:ring-[#1f93cd]/20"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={inputCls}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                      ))}
                    </select>
                    <input
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Location"
                      className={inputCls}
                    />
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-[rgba(192,199,209,0.8)] bg-white px-3 py-2.5 text-[13px] text-[#6d7783]">
                    <ImageIcon className="size-4 shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)}
                      className="min-w-0 flex-1 text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef6fb] file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-[#1f93cd]"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Rating */}
          {canLog && (
            <div className={sectionCls}>
              <div className="flex items-center justify-between">
                <p className={labelCls}>Rating <span className="text-[#ef4444]">*</span></p>
                <span
                  className="inline-flex size-10 items-center justify-center rounded-full text-[16px] font-bold text-white transition-colors"
                  style={{ background: color }}
                >
                  {rating}
                </span>
              </div>

              <div className="relative flex h-6 items-center">
                <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${fill}%`,
                      background: "linear-gradient(to right, #ef4444, #f59e0b, #22c55e)",
                    }}
                  />
                </div>
                <input
                  required
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="relative w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[#1f93cd] [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#1f93cd] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.18)]"
                />
              </div>

              <div className="flex justify-between text-[12px] text-[#b0b8c1]">
                <span>1 — Terrible</span>
                <span>10 — Amazing</span>
              </div>
            </div>
          )}

          {/* Comment + photo */}
          {canLog && (
            <div className={sectionCls}>
              <p className={labelCls}>
                {isCreatingNewActivity ? "Note" : "Comment"}{" "}
                <span className="font-normal normal-case tracking-normal text-[#b0b8c1]">(optional)</span>
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isCreatingNewActivity
                    ? "Add a note about this activity"
                    : "How was it? Would you recommend it?"
                }
                className="min-h-[88px] resize-none rounded-xl border border-[rgba(192,199,209,0.8)] bg-white px-4 py-3 text-[14px] text-[#323232] outline-none placeholder:text-[#b0b8c1] focus:border-[#1f93cd] focus:ring-2 focus:ring-[#1f93cd]/20"
              />
              {selectedActivity && (
                <label className="flex items-center gap-2 rounded-xl border border-[rgba(192,199,209,0.8)] bg-white px-3 py-2.5 text-[13px] text-[#6d7783]">
                  <ImageIcon className="size-4 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogPhoto(e.target.files?.[0] ?? null)}
                    className="min-w-0 flex-1 text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef6fb] file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-[#1f93cd]"
                  />
                </label>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
              {error}
            </div>
          )}
        </form>

        <div className="flex justify-end gap-2 pt-4 sticky w-full bottom-0 bg-white z-50 pb-5 px-8 border-t border-[rgba(192,199,209,0.5)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-full text-[#6d7783] hover:bg-[#f0f4f8]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="log-activity-form"
              disabled={saving || !canLog}
              className="rounded-full bg-[#1f93cd] text-white hover:bg-[#1a7fb3]"
            >
              {/*
              {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              */}
              Submit
            </Button>
          </div>
      </div>
    </div>
  );
}
