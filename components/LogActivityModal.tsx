"use client";

import { FormEvent, useEffect, useState } from "react";
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

  if (!res.ok) {
    throw new Error("Image upload failed.");
  }

  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) {
    throw new Error("Image upload did not return a URL.");
  }

  return json.secure_url;
}

export default function LogActivityModal({
  initialQuery,
  onClose,
  onLogged,
}: {
  initialQuery: string;
  onClose: () => void;
  onLogged: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
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
    if (selectedActivity) return;

    const query = searchQuery.trim();

    if (query.length < 2) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError("");

      try {
        const res = await fetch(`/api/activities?search=${encodeURIComponent(query)}`);
        const json = (await res.json()) as { data?: Activity[]; error?: string };

        if (!res.ok) {
          throw new Error(json.error || "Could not search activities.");
        }

        setResults(json.data ?? []);
        setSearched(true);
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : "Could not search activities.");
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery, selectedActivity]);

  async function createActivityIfNeeded() {
    if (selectedActivity) {
      return selectedActivity;
    }

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

    if (!res.ok) {
      throw new Error("error" in json ? json.error : "Could not create activity.");
    }

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
        body: JSON.stringify({
          activity_id: activity.activity_id,
          rating,
        }),
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

        if (!commentRes.ok) {
          throw new Error(commentJson.error || "Could not save comment.");
        }
      }

      onLogged();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not log activity.");
    } finally {
      setSaving(false);
    }
  }

  const needsCreate = !selectedActivity && searched && results.length === 0 && searchQuery.trim().length >= 2;
  const isCreatingNewActivity = needsCreate && !selectedActivity;
  const canLog = Boolean(selectedActivity) || needsCreate;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#101114]/68 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg border-2 border-[#c27a14] bg-[#7b4300] shadow-2xl shadow-black/35">
        <div className="flex items-center justify-between border-b border-[#a86105] bg-[#8f5005] px-5 py-4">
          <h2 className="text-xl font-black tracking-normal text-[#ffd86a]">Log activity modal</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md text-[#ffd86a] hover:bg-[#a86105] hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 text-[#ffe7a6]">
          <section className="grid gap-3 rounded-md border border-[#a86105] bg-[#6b3900] p-3">
            <p className="text-base font-black text-[#ffb322]">1. Search activity</p>

            {selectedActivity ? (
              <div className="flex items-start justify-between gap-3 rounded-md border border-[#d99627] bg-[#8f5005] px-3 py-3">
                <div>
                  <p className="font-semibold text-[#fff0bf]">{selectedActivity.title}</p>
                  <p className="text-sm text-[#ffd86a]">{selectedActivity.location}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="rounded-md px-2 py-1 text-sm font-semibold text-[#ffcf4d] hover:bg-[#a86105]"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#ffb322]" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => {
                      const nextQuery = event.target.value;
                      setSearchQuery(nextQuery);
                      setNewTitle(nextQuery.trim());

                      if (nextQuery.trim().length < 2) {
                        setResults([]);
                        setSearched(false);
                      }
                    }}
                    className="h-11 w-full rounded-md border border-[#c27a14] bg-[#fff0bf] pl-10 pr-3 text-[#5c3500] outline-none placeholder:text-[#9b784d] focus:border-[#ffb322] focus:ring-2 focus:ring-[#ffb322]/35"
                  />
                </label>

                {searching ? (
                  <div className="flex items-center gap-2 text-sm text-[#ffd86a]">
                    <Loader2 className="size-4 animate-spin" />
                    Searching
                  </div>
                ) : null}

                {results.length > 0 ? (
                  <div className="grid gap-2">
                    {results.map((activity) => (
                      <button
                        type="button"
                        key={activity.activity_id}
                        onClick={() => setSelectedActivity(activity)}
                        className="rounded-md border border-[#a86105] bg-[#8f5005] px-3 py-3 text-left hover:border-[#ffb322] hover:bg-[#9b5b0a]"
                      >
                        <span className="block font-semibold text-[#fff0bf]">{activity.title}</span>
                        <span className="block text-sm text-[#ffd86a]">{activity.location}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}

            {needsCreate ? (
              <div className="grid gap-3 rounded-md border border-[#c27a14] bg-[#8f5005] p-3">
                <div>
                  <p className="text-sm font-black text-[#ffb322]">Not found. Create new activity?</p>
                  <p className="mt-1 rounded-md border border-[#c27a14] bg-[#6b3900] px-3 py-2 text-sm font-semibold text-[#fff0bf]">
                    {newTitle}
                  </p>
                </div>
                <textarea
                  required
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  className="min-h-24 resize-y rounded-md border border-[#c27a14] bg-[#fff0bf] px-3 py-2 text-[#5c3500] outline-none placeholder:text-[#9b784d] focus:border-[#ffb322] focus:ring-2 focus:ring-[#ffb322]/35"
                  placeholder="Description"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    className="h-10 rounded-md border border-[#c27a14] bg-[#fff0bf] px-3 capitalize text-[#5c3500] outline-none focus:border-[#ffb322] focus:ring-2 focus:ring-[#ffb322]/35"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    value={newLocation}
                    onChange={(event) => setNewLocation(event.target.value)}
                    className="h-10 rounded-md border border-[#c27a14] bg-[#fff0bf] px-3 text-[#5c3500] outline-none placeholder:text-[#9b784d] focus:border-[#ffb322] focus:ring-2 focus:ring-[#ffb322]/35"
                    placeholder="Location"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-md border border-[#c27a14] bg-[#fff0bf] px-3 py-2 text-sm text-[#5c3500]">
                  <ImageIcon className="size-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setNewPhoto(event.target.files?.[0] ?? null)}
                    className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#ffb322] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-[#5c3500]"
                  />
                </label>
              </div>
            ) : null}
          </section>

          {canLog ? (
            <>
              <section className="grid gap-3 rounded-md border border-[#a86105] bg-[#6b3900] p-3">
                <p className="text-base font-black text-[#ffb322]">2. Rating 1-10</p>
                <div className="flex items-center gap-4">
                  <input
                    required
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                    className="h-2 flex-1 accent-[#ffb322]"
                  />
                  <span className="inline-flex size-11 items-center justify-center rounded-md bg-[#ffb322] text-base font-black text-[#5c3500]">
                    {rating}
                  </span>
                </div>
              </section>

              <section className="grid gap-3 rounded-md border border-[#a86105] bg-[#6b3900] p-3">
                <p className="text-base font-black text-[#ffb322]">
                  {isCreatingNewActivity ? "3. Optional note" : "3. Comment + photo"}
                </p>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={
                    isCreatingNewActivity
                      ? "Add a note about this activity"
                      : "Add a comment about your experience"
                  }
                  className="min-h-24 resize-y rounded-md border border-[#c27a14] bg-[#fff0bf] px-3 py-2 text-[#5c3500] outline-none placeholder:text-[#9b784d] focus:border-[#ffb322] focus:ring-2 focus:ring-[#ffb322]/35"
                />
                {selectedActivity ? (
                  <label className="flex items-center gap-2 rounded-md border border-[#c27a14] bg-[#fff0bf] px-3 py-2 text-sm text-[#5c3500]">
                    <ImageIcon className="size-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setLogPhoto(event.target.files?.[0] ?? null)}
                      className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#ffb322] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-[#5c3500]"
                    />
                  </label>
                ) : null}
              </section>
            </>
          ) : null}

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-[#a86105] pt-4">
            <Button type="button" variant="ghost" className="rounded-md text-[#ffe7a6] hover:bg-[#8f5005] hover:text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !canLog}
              className="rounded-md bg-[#ffb322] font-black text-[#5c3500] hover:bg-[#ffd86a]"
            >
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
