"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { getEvents } from "../../lib/api"
import { Event } from "../../types/event"

const CATEGORIES = [
  { label: "All",       value: "all",       emoji: "✨", color: "from-violet-500 to-pink-500" },
  { label: "Music",     value: "Music",     emoji: "🎵", color: "from-purple-500 to-violet-600" },
  { label: "Sports",    value: "Sports",    emoji: "⚽", color: "from-green-500 to-emerald-600" },
  { label: "Tech",      value: "Tech",      emoji: "💻", color: "from-blue-500 to-cyan-600" },
  { label: "Comedy",    value: "Comedy",    emoji: "😂", color: "from-yellow-400 to-orange-500" },
  { label: "Art",       value: "Art",       emoji: "🎨", color: "from-pink-500 to-rose-600" },
  { label: "Food",      value: "Food",      emoji: "🍕", color: "from-orange-400 to-red-500" },
  { label: "Business",  value: "Business",  emoji: "💼", color: "from-slate-500 to-gray-600" },
  { label: "Health",    value: "Health",    emoji: "🏋️", color: "from-teal-500 to-green-600" },
  { label: "Education", value: "Education", emoji: "📚", color: "from-indigo-500 to-blue-600" },
]

const CATEGORY_PILL: Record<string, string> = {
  Music:     "bg-purple-900/60 text-purple-300 border border-purple-600/30",
  Sports:    "bg-green-900/60  text-green-300  border border-green-600/30",
  Tech:      "bg-blue-900/60   text-blue-300   border border-blue-600/30",
  Comedy:    "bg-yellow-900/60 text-yellow-300 border border-yellow-600/30",
  Art:       "bg-pink-900/60   text-pink-300   border border-pink-600/30",
  Food:      "bg-orange-900/60 text-orange-300 border border-orange-600/30",
  Business:  "bg-slate-700/60  text-slate-300  border border-slate-500/30",
  Health:    "bg-teal-900/60   text-teal-300   border border-teal-600/30",
  Education: "bg-indigo-900/60 text-indigo-300 border border-indigo-600/30",
}

const FALLBACKS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=300&fit=crop",
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [category, setCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 12

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEvents({ category, search, page, limit: LIMIT })
      setEvents(data.events || [])
      setTotal(data.total || 0)
    } catch { setEvents([]) }
    setLoading(false)
  }, [category, search, page])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const totalPages = Math.ceil(total / LIMIT)
  const activeCat = CATEGORIES.find(c => c.value === category)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-gray-950 via-violet-950/40 to-gray-950 border-b border-white/5">
        {/* decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-700/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-pink-700/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-400 font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            {total > 0 ? `${total} events available` : "Discover events near you"}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Find your next{" "}
            <span className="bg-linear-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              experience
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Book tickets for music, sports, tech, comedy and more
          </p>

          {/* Search */}
          <div className="flex max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/20 border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="flex items-center pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              className="flex-1 bg-transparent px-4 py-3.5 text-white text-sm placeholder-gray-500 outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch("") }}
                className="px-3 text-gray-500 hover:text-white transition"
              >×</button>
            )}
            <button
              onClick={() => { setSearch(searchInput); setPage(1) }}
              className="px-6 bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-semibold transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                category === cat.value
                  ? `bg-linear-to-r ${cat.color} text-white border-transparent shadow-lg scale-105`
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Admin Create */}
        {role === "admin" && (
          <div className="flex justify-end mb-6">
            <Link href="/admin/events/create" className="px-5 py-2 bg-linear-to-r from-violet-600 to-pink-600 text-white rounded-xl shadow hover:opacity-90 transition text-sm font-semibold">
              + Create Event
            </Link>
          </div>
        )}

        {/* Results info */}
        {!loading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-500 text-sm">
              {total > 0
                ? <><span className="text-white font-medium">{total} events</span>{activeCat && activeCat.value !== "all" ? ` in ${activeCat.label}` : ""}</>
                : <span className="text-gray-500">No events found</span>}
            </p>
            {search && (
              <button onClick={() => { setSearchInput(""); setSearch("") }} className="text-xs text-violet-400 hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse border border-white/5">
                <div className="h-44 bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-600">
            <span className="text-7xl mb-5">🔍</span>
            <p className="text-xl font-semibold text-gray-400">No events found</p>
            <p className="text-sm mt-2 text-gray-600">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {events.map((event, idx) => (
              <Link
                href={`/events/${event.id}`}
                key={event.id}
                className="group relative flex flex-col bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-900/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={
                      event.banner_url && !event.banner_url.startsWith("vxbncmvbn") && event.banner_url.startsWith("http")
                        ? event.banner_url
                        : FALLBACKS[idx % FALLBACKS.length]
                    }
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[idx % FALLBACKS.length] }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                  {/* Category badge */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${CATEGORY_PILL[event.category] || "bg-gray-800 text-gray-300 border border-gray-600"}`}>
                    {event.category}
                  </span>

                  {/* Status badge */}
                  {event.status === "sold_out" ? (
                    <span className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      SOLD OUT
                    </span>
                  ) : event.available_seats > 0 && event.available_seats <= 10 ? (
                    <span className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {event.available_seats} left!
                    </span>
                  ) : null}

                  {/* Price in corner */}
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-full border border-white/10">
                      {event.price === 0 ? "Free" : `₹${event.price.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                    {event.title}
                  </h2>

                  <div className="space-y-1.5 text-xs text-gray-400 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>
                        {new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {event.event_time && ` · ${event.event_time}`}
                      </span>
                    </div>
                    {event.duration_mins > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span>⏱</span>
                        <span>
                          {event.duration_mins >= 60
                            ? `${Math.floor(event.duration_mins / 60)}h${event.duration_mins % 60 ? ` ${event.duration_mins % 60}m` : ""}`
                            : `${event.duration_mins}m`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{event.available_seats?.toLocaleString()} seats left</span>
                    <span className="text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 disabled:opacity-30 transition"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  page === p
                    ? "bg-linear-to-r from-violet-600 to-pink-600 text-white border-transparent"
                    : "text-gray-400 border-white/10 hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 disabled:opacity-30 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  Music: "bg-purple-100 text-purple-700",
  Sports: "bg-green-100 text-green-700",
  Tech: "bg-blue-100 text-blue-700",
  Comedy: "bg-yellow-100 text-yellow-700",
  Art: "bg-pink-100 text-pink-700",
  Food: "bg-orange-100 text-orange-700",
  Business: "bg-gray-100 text-gray-700",
  Health: "bg-teal-100 text-teal-700",
  Education: "bg-indigo-100 text-indigo-700",
}

const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop",
]

