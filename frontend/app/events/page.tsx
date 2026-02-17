"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Event = {
  id: number
  title: string
  description: string
  location: string
  event_date: string
  category: string
  available_seats: number
}

export default function EventsPage() {
  const router = useRouter()

  const [events, setEvents] = useState<Event[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)
  const limit = 6

  const fetchEvents = async () => {
    let url = `http://localhost:8080/events?page=${page}&limit=${limit}`

    if (search) url += `&search=${search}`
    if (category) url += `&category=${category}`

    const res = await fetch(url)
    const data = await res.json()

    setEvents(data.events || [])
  }

  useEffect(() => {
    fetchEvents()
  }, [page])

  return (
    <div style={{ padding: 20 }}>
      <h1>Events</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">All Categories</option>
          <option value="music">Music</option>
          <option value="tech">Tech</option>
          <option value="sports">Sports</option>
        </select>

        <button onClick={fetchEvents} style={{ marginLeft: 10 }}>
          Apply
        </button>
      </div>

      <div>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              border: "1px solid gray",
              padding: 10,
              marginBottom: 10,
              cursor: "pointer",
            }}
            onClick={() => router.push(`/events/${event.id}`)}
          >
            <h3>{event.title}</h3>
            <p>{event.location}</p>
            <p>{event.category}</p>
            <p>Available Seats: {event.available_seats}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>Page {page}</span>

        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  )
}