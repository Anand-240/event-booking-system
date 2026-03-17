"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getEvents } from "../../../lib/api"
import { Event } from "../../../types/event"

function formatEventDate(date: string, time: string) {
  return `${new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}${time ? ` · ${time}` : ""}`
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents({ page: 1, limit: 50 })
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false))
  }, [])

  const summary = useMemo(() => {
    const totalSeats = events.reduce((sum, event) => sum + (event.total_seats || 0), 0)
    const availableSeats = events.reduce((sum, event) => sum + (event.available_seats || 0), 0)
    const soldOut = events.filter((event) => event.status === "sold_out" || event.available_seats === 0).length

    return {
      totalEvents: events.length,
      totalSeats,
      availableSeats,
      soldOut,
    }
  }, [events])

  return (
    <div className="min-h-screen text-white">
      <section className="shell-container px-4 pb-8 pt-2">
        <div className="overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-[#101a2f] via-[#15122a] to-[#0b1423] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute left-1/3 top-8 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Admin Control Room</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Manage your live calendar with a cleaner, faster event console.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300">
                  Review inventory, seat availability, timing, venue information, and launch new events from one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="rounded-2xl border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-gray-200 backdrop-blur-sm hover:bg-white/10"
                >
                  Preview Public Site
                </Link>
                <Link
                  href="/admin/events/create"
                  className="rounded-2xl bg-linear-to-r from-orange-500 via-rose-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/30 hover:brightness-110"
                >
                  + Create Event
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                { label: "Total Events", value: summary.totalEvents, tint: "from-orange-500/20 to-transparent" },
                { label: "Seat Inventory", value: summary.totalSeats.toLocaleString("en-IN"), tint: "from-sky-500/20 to-transparent" },
                { label: "Seats Available", value: summary.availableSeats.toLocaleString("en-IN"), tint: "from-emerald-500/20 to-transparent" },
                { label: "Sold Out", value: summary.soldOut, tint: "from-rose-500/20 to-transparent" },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border border-white/10 bg-linear-to-br ${item.tint} bg-white/5 p-5 backdrop-blur-sm`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-extrabold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell-container px-4 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Event Inventory</h2>
            <p className="mt-1 text-sm text-gray-400">A compact overview of the events currently visible in your system.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-panel rounded-3xl p-5 animate-pulse">
                <div className="h-40 rounded-2xl bg-white/5" />
                <div className="mt-4 h-5 w-2/3 rounded bg-white/5" />
                <div className="mt-3 h-4 w-1/2 rounded bg-white/5" />
                <div className="mt-6 h-10 rounded-2xl bg-white/5" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-panel rounded-4xl p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500/25 to-sky-500/20 text-2xl">
              ✨
            </div>
            <h3 className="mt-5 text-2xl font-bold">No events yet</h3>
            <p className="mt-3 text-sm text-gray-400">Create your first event to start filling the booking flow with real inventory.</p>
            <Link
              href="/admin/events/create"
              className="mt-6 inline-flex rounded-2xl bg-linear-to-r from-orange-500 via-rose-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/30 hover:brightness-110"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const soldOut = event.status === "sold_out" || event.available_seats === 0

              return (
                <div key={event.id} className="glass-panel group overflow-hidden rounded-4xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:border-white/20">
                  <div className="relative h-44 overflow-hidden bg-[#0d1728]">
                    <img
                      src={event.banner_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&h=500&fit=crop"}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#09111d] via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#08111b]/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {event.category}
                    </span>
                    <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${soldOut ? "bg-rose-500/90 text-white" : "bg-emerald-500/85 text-white"}`}>
                      {soldOut ? "Sold Out" : "Live"}
                    </span>
                  </div>

                  <div className="space-y-5 p-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">{event.organizer || "Organizer not set"}</p>
                    </div>

                    <div className="grid gap-3 text-sm text-gray-300">
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>Venue</span>
                        <span className="max-w-[55%] truncate font-semibold text-white">{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>Date & Time</span>
                        <span className="font-semibold text-white">{formatEventDate(event.event_date, event.event_time)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>Availability</span>
                        <span className="font-semibold text-white">{event.available_seats}/{event.total_seats}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>Ticket Price</span>
                        <span className="font-semibold text-white">₹{event.price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm">
                      <span className="text-gray-400">Event #{event.id}</span>
                      <Link href={`/events/${event.id}`} className="font-semibold text-orange-300 hover:text-orange-200">
                        View Public Page →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}