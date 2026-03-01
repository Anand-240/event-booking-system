"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { getMyBookings } from "../../../lib/api"
import { Booking } from "../../../types/booking"

function isTicketExpired(eventDate: string, eventTime: string, durationMins: number): boolean {
  try {
    const dateStr = eventDate.split("T")[0]
    const timeStr = eventTime || "23:59"
    const start = new Date(`${dateStr}T${timeStr}:00`)
    const end = new Date(start.getTime() + (durationMins || 60) * 60 * 1000)
    return new Date() > end
  } catch {
    return false
  }
}

function QRTicket({ booking }: { booking: Booking }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [expanded, setExpanded] = useState(false)

  const expired = isTicketExpired(
    booking.event.event_date,
    booking.event.event_time,
    booking.event.duration_mins
  )

  const qrPayload = JSON.stringify({
    booking_id: booking.id,
    event_id: booking.event_id,
    event: booking.event.title,
    seats: booking.seats?.map((s) => s.seat_number) || [],
    qty: booking.quantity,
    payment_id: booking.payment_id,
    status: booking.status,
  })

  useEffect(() => {
    if (!expired) {
      QRCode.toDataURL(qrPayload, {
        width: 200,
        margin: 2,
        color: { dark: "#1e3a5f", light: "#ffffff" },
      }).then(setQrDataUrl)
    }
  }, [qrPayload, expired])

  const eventDate = new Date(booking.event.event_date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const seats = booking.seats?.map((s) => s.seat_number).join(", ") || `${booking.quantity} seat(s)`

  return (
    <div
      className={`relative bg-gray-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
        expired ? "border-white/5 opacity-60" : "border-white/5 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-900/20"
      }`}
    >
      {/* Expired overlay */}
      {expired && (
        <div className="absolute inset-0 bg-gray-950/70 z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="text-4xl mb-1">⌛</div>
            <span className="bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full">
              EXPIRED
            </span>
          </div>
        </div>
      )}

      {/* Ticket Header */}
      <div className={`px-5 py-4 ${
        expired ? "bg-gray-800" : "bg-linear-to-r from-violet-900/80 to-pink-900/60"
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-extrabold text-base truncate text-white">{booking.event.title}</h3>
            <p className="text-violet-300/70 text-xs mt-0.5">{booking.event.organizer}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 border ${
            booking.status === "confirmed"
              ? "bg-green-900/50 text-green-400 border-green-700/40"
              : "bg-yellow-900/50 text-yellow-400 border-yellow-700/40"
          }`}>
            {booking.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="px-5 py-4 flex gap-4 items-start">
        {/* QR Code */}
        <div className="shrink-0">
          {expired ? (
            <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center text-gray-600 text-xs font-medium">
              Expired
            </div>
          ) : qrDataUrl ? (
            <div
              className="cursor-pointer group relative"
              onClick={() => setExpanded(true)}
              title="Click to enlarge QR"
            >
              <img src={qrDataUrl} alt="Ticket QR" className="w-24 h-24 rounded-xl border border-violet-700/30 group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-violet-900/0 group-hover:bg-violet-900/30 rounded-xl transition flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-bold text-violet-300">
                🔍 Enlarge
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-800 rounded-xl animate-pulse" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 text-xs space-y-2">
          <div>
            <span className="text-gray-500 font-medium">📅 Date & Time</span>
            <p className="text-white font-semibold">{eventDate} · {booking.event.event_time || "TBA"}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">📍 Location</span>
            <p className="text-white font-semibold truncate">{booking.event.location}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">🪑 Seats</span>
            <p className="text-white font-semibold">{seats}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">🎫 Booking ID</span>
            <p className="text-violet-400 font-mono font-bold">#{booking.id}</p>
          </div>
          <div>
            <span className="text-gray-500 font-medium">💰 Paid</span>
            <p className="text-white font-semibold">₹{(booking.amount / 100).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Dashed separator */}
      <div className="px-5 flex items-center gap-2 my-1">
        <div className="w-5 h-5 rounded-full bg-gray-950 border border-white/5 -ml-7 shrink-0" />
        <div className="flex-1 border-t-2 border-dashed border-white/5" />
        <div className="w-5 h-5 rounded-full bg-gray-950 border border-white/5 -mr-7 shrink-0" />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-950/40 flex items-center justify-between text-xs text-gray-600">
        <span>Scan at venue entrance</span>
        {!expired && <span className="text-green-400 font-semibold flex items-center gap-1">✅ Valid</span>}
      </div>

      {/* QR Enlarged Modal */}
      {expanded && qrDataUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-xl text-white mb-1">{booking.event.title}</h3>
            <p className="text-sm text-gray-500 mb-4">Booking #{booking.id} · {seats}</p>
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-2xl border border-violet-700/30" />
            <p className="text-xs text-gray-500 mt-4">Show this QR at the venue entrance</p>
            <button
              onClick={() => setExpanded(false)}
              className="mt-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-6 py-2 rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WalletPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) { router.push("/auth/login"); return }

    getMyBookings().then((data) => {
      const confirmed = Array.isArray(data)
        ? data.filter((b: Booking) => b.status === "confirmed" || b.payment_status === "paid")
        : []
      setBookings(confirmed)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const filtered = bookings.filter((b) => {
    if (!b.event) return filter === "all"
    const expired = isTicketExpired(b.event.event_date, b.event.event_time, b.event.duration_mins)
    if (filter === "upcoming") return !expired
    if (filter === "past") return expired
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">🎫 My Wallet</h1>
            <p className="text-gray-500 text-sm mt-1">{bookings.length} ticket{bookings.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${
                filter === f
                  ? "bg-linear-to-r from-violet-600 to-pink-600 text-white shadow"
                  : "bg-gray-900 text-gray-400 border border-white/10 hover:border-violet-500/40"
              }`}
            >
              {f === "upcoming" ? "🟢 Upcoming" : f === "past" ? "⌛ Past" : "📋 All"}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <span className="text-6xl mb-4">🎫</span>
            <p className="text-xl font-semibold text-white">No tickets yet</p>
            <p className="text-sm mt-1 mb-6">Book an event and your tickets will appear here</p>
            <button
              onClick={() => router.push("/events")}
              className="bg-linear-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-pink-500 transition"
            >
              Explore Events →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <QRTicket key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
