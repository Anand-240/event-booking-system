"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Events() {
  const [events, setEvents] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then(res => res.json())
      .then(data => setEvents(data.events || []))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6">Events</h1>

      <div className="grid grid-cols-3 gap-6">
        {events.map(event => (
          <div
            key={event.id}
            onClick={() => router.push(`/events/${event.id}`)}
            className="border p-4 rounded cursor-pointer hover:shadow-lg"
          >
            <h2 className="text-xl font-bold">{event.title}</h2>
            <p>{event.location}</p>
            <p className="text-sm text-gray-500">{event.category}</p>
          </div>
        ))}
      </div>
    </div>
  )
}