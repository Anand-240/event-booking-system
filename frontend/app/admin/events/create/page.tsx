"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createAdminEvent } from "../../../../lib/api"

const categories = ["Music", "Sports", "Tech", "Comedy", "Conference", "Workshop", "Wellness"]
const statuses = [
  { value: "available", label: "Available" },
  { value: "sold_out", label: "Sold Out" },
]

export default function CreateEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [durationMins, setDurationMins] = useState(120)
  const [category, setCategory] = useState("Music")
  const [seats, setSeats] = useState(100)
  const [capacity, setCapacity] = useState(100)
  const [price, setPrice] = useState(999)
  const [organizer, setOrganizer] = useState("")
  const [bannerURL, setBannerURL] = useState("")
  const [status, setStatus] = useState("available")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const availableSeats = useMemo(() => {
    if (status === "sold_out") return 0
    return Math.max(seats, 0)
  }, [seats, status])

  const handleCreate = async () => {
    setError("")

    if (!title || !description || !location || !date || !time || !organizer) {
      setError("Please fill all required fields.")
      return
    }

    if (seats <= 0 || capacity <= 0) {
      setError("Seats and capacity must be greater than 0.")
      return
    }

    if (capacity < seats) {
      setError("Capacity should be equal to or greater than total seats.")
      return
    }

    if (price < 0) {
      setError("Price cannot be negative.")
      return
    }

    setLoading(true)
    const data = await createAdminEvent({
      title,
      description,
      location,
      date,
      event_time: time,
      duration_mins: durationMins,
      category,
      seats,
      capacity,
      price,
      organizer,
      banner_url: bannerURL,
      status,
    })
    setLoading(false)

    if (data.error) {
      setError(data.error)
      return
    }

    router.push("/admin/events")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">Admin Console</p>
            <h1 className="mt-2 text-3xl font-extrabold">Create New Event</h1>
            <p className="mt-2 text-sm text-gray-400">
              Add venue, date, timing, seat count, availability, pricing, and the other event details used across the app.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-violet-500/40 hover:text-white"
          >
            Back to Admin Events
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-gray-950/70 p-6 shadow-2xl shadow-violet-950/20 backdrop-blur">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Event Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="IPL 2026 - Mumbai vs Chennai"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Organizer</span>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Ananda Wellness"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                >
                  {categories.map((item) => (
                    <option key={item} value={item} className="bg-gray-950">
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event, expected audience, highlights, and what attendees will get."
                  className="h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Venue</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Wankhede Stadium, Mumbai"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Time</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Duration (minutes)</span>
                <input
                  type="number"
                  min="1"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Price per ticket (INR)</span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Total Seats</span>
                <input
                  type="number"
                  min="1"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Capacity</span>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Availability</span>
                <input
                  type="text"
                  value={`${availableSeats} seats available on create`}
                  disabled
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-gray-300 outline-none"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                >
                  {statuses.map((item) => (
                    <option key={item.value} value={item.value} className="bg-gray-950">
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Banner Image URL</span>
                <input
                  type="text"
                  value={bannerURL}
                  onChange={(e) => setBannerURL(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-700/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 rounded-2xl bg-linear-to-r from-violet-600 to-pink-600 px-6 py-3 font-bold text-white transition hover:from-violet-500 hover:to-pink-500 disabled:opacity-60"
              >
                {loading ? "Creating Event..." : "Create Event"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/events")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-gray-300 transition hover:border-white/20 hover:text-white"
              >
                View Public Events
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-linear-to-b from-violet-950/70 to-gray-950 p-6 shadow-2xl shadow-violet-950/20">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-300">Live Preview</p>
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gray-950">
              <div className="h-48 w-full bg-gray-900">
                {bannerURL ? (
                  <img src={bannerURL} alt={title || "Event banner preview"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-linear-to-br from-violet-700/40 to-pink-700/30 text-sm text-gray-300">
                    Banner preview
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{title || "Event title"}</h2>
                    <p className="mt-1 text-sm text-violet-300">{organizer || "Organizer name"}</p>
                  </div>
                  <span className="rounded-full border border-green-700/30 bg-green-900/30 px-3 py-1 text-xs font-bold text-green-300">
                    {status === "sold_out" ? "SOLD OUT" : "AVAILABLE"}
                  </span>
                </div>

                <p className="text-sm leading-6 text-gray-300">{description || "Your event description will appear here."}</p>

                <div className="grid gap-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    <span>Venue</span>
                    <span className="font-semibold text-white">{location || "Venue location"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    <span>Date & Time</span>
                    <span className="font-semibold text-white">{date || "YYYY-MM-DD"} {time || "HH:MM"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    <span>Seats / Availability</span>
                    <span className="font-semibold text-white">{seats} total · {availableSeats} available</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    <span>Price</span>
                    <span className="font-semibold text-white">₹{price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    <span>Category</span>
                    <span className="font-semibold text-white">{category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}