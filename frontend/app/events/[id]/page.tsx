"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEvent, getSeats } from "../../../lib/api"
import { Event, Seat } from "../../../types/event"

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

function formatDuration(mins: number) {
  if (!mins || mins === 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export default function EventDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [event, setEvent] = useState<Event | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [eventData, seatsData] = await Promise.all([
          getEvent(id as string),
          getSeats(id as string),
        ])
        setEvent(eventData.event || eventData)
        setSeats(Array.isArray(seatsData) ? seatsData : [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

  const toggleSeat = (seatNumber: string, isBooked: boolean) => {
    if (isBooked) return
    setSelectedSeats(prev =>
      prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
    )
  }

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem("access_token")
    if (!token) { router.push("/auth/login"); return }
    sessionStorage.setItem("selected_seats", JSON.stringify(selectedSeats))
    router.push(`/events/${id}/checkout`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <p className="text-xl text-white">Event not found</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-violet-400 hover:underline">← Go back</button>
        </div>
      </div>
    )
  }

  const eventDateTime = new Date(`${event.event_date.split("T")[0]}T${event.event_time || "00:00"}`)
  const isPast = eventDateTime < new Date()
  const totalPrice = selectedSeats.length * event.price
  const bookedCount = seats.filter(s => s.is_booked).length
  const availableCount = seats.length - bookedCount

  const fallbackBanner = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=500&fit=crop"
  const banner = event.banner_url && event.banner_url.startsWith("http") ? event.banner_url : fallbackBanner

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── Hero Banner ── */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img src={banner} alt={event.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallbackBanner }} />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0f] via-black/50 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-sm ${CATEGORY_PILL[event.category] || "bg-gray-800 text-gray-300 border border-gray-600"}`}>
              {event.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg leading-tight">
              {event.title}
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Organized by <span className="text-white font-semibold">{event.organizer || "Unknown"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">About this Event</h2>
            <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">{event.description || "No description provided."}</p>
          </div>

          {/* Info Grid */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Event Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoCard emoji="📅" label="Date" value={new Date(event.event_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
              <InfoCard emoji="🕐" label="Time" value={event.event_time || "TBA"} />
              {formatDuration(event.duration_mins) && <InfoCard emoji="⏱" label="Duration" value={formatDuration(event.duration_mins)!} />}
              <InfoCard emoji="📍" label="Venue" value={event.location} />
              <InfoCard emoji="🪑" label="Capacity" value={`${(event.capacity || event.total_seats)?.toLocaleString()} seats`} />
              <InfoCard emoji="✅" label="Available" value={`${event.available_seats?.toLocaleString()} seats`} />
            </div>
          </div>

          {/* Seat Grid */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Select Your Seats</h2>
              {isPast && (
                <span className="bg-red-900/50 text-red-400 border border-red-600/30 text-xs font-bold px-3 py-1 rounded-full">
                  Event Ended
                </span>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-5 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 inline-block" /> Available
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-violet-600 inline-block" /> Selected
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-red-900/60 border border-red-600/30 inline-block" /> Booked
              </span>
            </div>

            {/* Stage */}
            <div className="w-full bg-linear-to-r from-violet-900/50 via-violet-800/60 to-violet-900/50 border border-violet-600/20 text-violet-300 text-center text-xs font-bold py-2.5 rounded-xl mb-6 tracking-widest">
              ★ STAGE ★
            </div>

            {seats.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No seats configured for this event</p>
            ) : (
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                {seats.map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => !isPast && toggleSeat(seat.seat_number, seat.is_booked)}
                    disabled={seat.is_booked || isPast}
                    title={`Seat ${seat.seat_number}${seat.is_booked ? " (Booked)" : ""}`}
                    className={`h-8 w-full text-[10px] font-semibold rounded-md transition-all duration-150 border ${
                      seat.is_booked
                        ? "bg-red-900/40 text-red-500 border-red-600/20 cursor-not-allowed"
                        : selectedSeats.includes(seat.seat_number)
                        ? "bg-violet-600 text-white border-violet-400 scale-105 shadow-lg shadow-violet-900/40"
                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-violet-900/30 hover:border-violet-500/30 hover:text-white cursor-pointer"
                    }`}
                  >
                    {seat.seat_number}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
              <span>Total: <span className="text-gray-400">{seats.length}</span></span>
              <span>Booked: <span className="text-red-500">{bookedCount}</span></span>
              <span>Available: <span className="text-green-500">{availableCount}</span></span>
              {selectedSeats.length > 0 && (
                <span>Selected: <span className="text-violet-400">{selectedSeats.length}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Booking Panel ── */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-5">Booking Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price per seat</span>
                <span className="text-white font-medium">{event.price === 0 ? "Free" : `₹${event.price.toLocaleString("en-IN")}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Selected seats</span>
                <span className="text-white font-medium">{selectedSeats.length}</span>
              </div>

              {selectedSeats.length > 0 && (
                <div className="flex flex-wrap gap-1.5 bg-violet-950/40 border border-violet-800/30 rounded-xl p-3">
                  {selectedSeats.map(s => (
                    <span key={s} className="text-xs bg-violet-800/50 text-violet-300 px-2 py-0.5 rounded-md border border-violet-700/30">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-white/5 pt-3 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-xl font-extrabold bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  {event.price === 0 ? "Free" : `₹${totalPrice.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>

            {event.status === "sold_out" ? (
              <div className="w-full bg-red-900/30 text-red-400 border border-red-700/30 text-center font-bold py-3 rounded-xl">
                Sold Out
              </div>
            ) : isPast ? (
              <div className="w-full bg-white/5 text-gray-500 border border-white/5 text-center font-bold py-3 rounded-xl">
                Event Ended
              </div>
            ) : (
              <button
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-violet-900/30 disabled:bg-none disabled:bg-white/5 disabled:text-gray-500"
              >
                {selectedSeats.length === 0 ? "Select seats to continue" : `Pay ₹${totalPrice.toLocaleString("en-IN")} →`}
              </button>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure payment via Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 hover:border-white/10 transition">
      <div className="text-lg mb-1">{emoji}</div>
      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-white mt-0.5 leading-snug">{value}</div>
    </div>
  )
}

