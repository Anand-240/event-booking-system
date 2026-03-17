"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMyBookings } from "../../../lib/api"
import { getDisplayedBookingAmountRupees } from "../../../lib/pricing"
import { Booking } from "../../../types/booking"

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-900/40 text-green-400 border border-green-700/30",
  pending_payment: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/30",
  cancelled: "bg-red-900/40 text-red-400 border border-red-700/30",
  refunded: "bg-gray-800 text-gray-400 border border-gray-700/30",
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-900/30 text-green-500 border border-green-800/30",
  pending: "bg-yellow-900/30 text-yellow-500 border border-yellow-800/30",
  refunded: "bg-gray-800 text-gray-500 border border-gray-700/30",
  failed: "bg-red-900/30 text-red-500 border border-red-800/30",
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) { router.push("/auth/login"); return }

    getMyBookings().then((data) => {
      setBookings(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const filtered = bookings.filter((b) => filter === "all" || b.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link
            href="/dashboard/wallet"
            className="bg-linear-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-violet-500 hover:to-pink-500 transition"
          >
            🎫 My Wallet
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "All", value: "all" },
            { label: "✅ Confirmed", value: "confirmed" },
            { label: "⏳ Pending", value: "pending_payment" },
            { label: "❌ Cancelled", value: "cancelled" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filter === f.value
                  ? "bg-linear-to-r from-violet-600 to-pink-600 text-white shadow"
                  : "bg-gray-900 text-gray-400 border border-white/10 hover:border-violet-500/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <span className="text-6xl mb-4">📋</span>
            <p className="text-xl font-semibold text-white">No bookings found</p>
            <p className="text-sm mt-1 mb-6">
              {filter === "all" ? "You haven't booked anything yet" : `No ${filter} bookings`}
            </p>
            <Link href="/events" className="bg-linear-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-pink-500 transition">
              Browse Events →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const displayedAmount = getDisplayedBookingAmountRupees(
                booking.amount,
                booking.event.price,
                booking.quantity
              )

              return (
              <div key={booking.id} className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-900/20 transition">
                <div className="flex gap-4 p-5">
                  {/* Event Banner Thumbnail */}
                  <img
                    src={booking.event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&h=60&fit=crop"}
                    alt={booking.event.title}
                    className="w-20 h-14 object-cover rounded-xl shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base truncate flex-1">{booking.event.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLES[booking.status] || "bg-gray-800 text-gray-400"}`}>
                          {booking.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PAYMENT_STATUS_STYLES[booking.payment_status] || "bg-gray-800 text-gray-500"}`}>
                          {booking.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>📅 {new Date(booking.event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>🕐 {booking.event.event_time || "TBA"}</span>
                      <span>📍 {booking.event.location}</span>
                      <span>🪑 {booking.quantity} seat{booking.quantity > 1 ? "s" : ""}</span>
                    </div>

                    {booking.seats && booking.seats.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {booking.seats.map((s) => (
                          <span key={s.id} className="bg-violet-900/50 text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full border border-violet-700/30">{s.seat_number}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-950/50 px-5 py-3 flex items-center justify-between text-xs text-gray-600 border-t border-white/5">
                  <span>Booking <span className="font-mono font-bold text-gray-400">#{booking.id}</span> · {new Date(booking.created_at).toLocaleDateString("en-IN")}</span>
                  <span className="font-bold text-white">₹{displayedAmount.toLocaleString("en-IN")}</span>
                </div>

                {/* Pending Payment CTA */}
                {booking.status === "pending_payment" && (
                  <div className="px-5 py-3 bg-yellow-900/20 border-t border-yellow-800/30 flex items-center justify-between">
                    <p className="text-xs text-yellow-400 font-medium">⚠️ Payment pending — complete to confirm your seats</p>
                    <Link
                      href={`/events/${booking.event_id}/checkout`}
                      className="text-xs bg-yellow-500 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition"
                    >
                      Complete Payment
                    </Link>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
