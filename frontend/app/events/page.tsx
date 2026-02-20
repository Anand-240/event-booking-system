"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category !== "all") params.append("category", category)

    const res = await fetch(`http://localhost:8080/events?${params.toString()}`)
    const data = await res.json()


    setEvents(data.events || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSearch = () => fetchEvents()

  const handleCategory = (c: string) => {
    setCategory(c)
    setTimeout(fetchEvents, 100)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center text-black">Events</h1>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center text-black">
        <input
          type="text"
          placeholder="Search events..."
          className="border p-3 w-full md:w-72 rounded-lg shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg shadow-sm w-full md:w-56"
          value={category}
          onChange={(e) => handleCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Tech">Tech</option>
          <option value="Comedy">Comedy</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event: any) => (
            <Link
              href={`/events/${event.id}`}
              key={event.id}
              className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={event.banner_url || "https://via.placeholder.com/300x200"}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h2 className="text-xl font-semibold">{event.title}</h2>
                <p className="text-sm text-gray-600">{event.location}</p>

                <p className="text-sm text-gray-500 mt-1">
                  {new Date(event.event_date).toDateString()}
                </p>

                <span className="mt-3 inline-block bg-gray-200 px-3 py-1 text-xs rounded">
                  {event.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}