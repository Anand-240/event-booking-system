"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    apiFetch("/events")
      .then((data) => setEvents(data.events))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Events</h1>
      <div className="grid grid-cols-3 gap-4">
        {events.map((event: any) => (
          <div key={event.id} className="border p-4 rounded">
            <h2 className="font-semibold">{event.title}</h2>
            <p>{event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}