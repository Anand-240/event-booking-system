"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function EventsPage() {
  const router = useRouter()

  const [events, setEvents] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)

  const fetchEvents = async () => {
    const res = await fetch(
      `http://localhost:8080/events?search=${search}&category=${category}&page=${page}&limit=6`
    )
    const data = await res.json()
    setEvents(data.events || data)
  }

  useEffect(() => {
    fetchEvents()
  }, [search, category, page])

  return (
    <div className="min-h-screen bg-black-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Explore Events</h1>

      <div className="flex gap-4 mb-6">
        <input
          placeholder="Search events..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => {
            setPage(1)
            setCategory(e.target.value)
          }}
        >
          <option value="">All Categories</option>
          <option value="Music">Music</option>
          <option value="Tech">Tech</option>
          <option value="Business">Business</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {events.length === 0 && (
        <p className="text-gray-500">No events found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow rounded p-5 cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(`/events/${event.id}`)}
          >
            <h2 className="text-xl font-semibold mb-2">
              {event.title}
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              {event.description}
            </p>
            <p className="text-sm text-gray-500">
              {event.location}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              {event.category}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-white rounded disabled:opacity-50 text-black"
        >
          Prev
        </button>

        <span className="px-4 py-2 bg-white rounded shadow text-black">
          Page {page}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-300 rounded text-black"
        >
          Next
        </button>
      </div>
    </div>
  )
}