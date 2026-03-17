"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { bookSeats, cancelPendingPayment, getEvent, simulatePayment } from "../../../../lib/api"
import { GST_PERCENT, PLATFORM_FEE_PERCENT, calculateBookingTotalRupees } from "../../../../lib/pricing"
import { Event } from "../../../../types/event"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")
  const releasingBookingRef = useRef(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("selected_seats")
    if (!stored) { router.push(`/events/${id}`); return }
    const seats: string[] = JSON.parse(stored)
    if (seats.length === 0) { router.push(`/events/${id}`); return }
    setSelectedSeats(seats)

    getEvent(id).then((data) => {
      setEvent(data.event || data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, router])

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  const { baseAmount, platformFee, gst, totalAmount } = calculateBookingTotalRupees(
    event.price,
    selectedSeats.length
  )
  const totalPaise = Math.round(totalAmount * 100)

  const releasePendingSeats = async (bookingId: number | string) => {
  if (releasingBookingRef.current) {
    return
  }

  releasingBookingRef.current = true
  try {
    await cancelPendingPayment(bookingId)
  } finally {
    releasingBookingRef.current = false
  }
  }

  const handlePayment = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) { router.push("/auth/login"); return }

    setPaying(true)
    setError("")

    try {
     
      const bookingRes = await bookSeats(id, selectedSeats)

      if (bookingRes.error) {
        setError(bookingRes.error)
        setPaying(false)
        return
      }

      const booking_id = bookingRes.booking_id
      const razorpay_order_id = bookingRes.razorpay_order_id
      const razorpay_key = bookingRes.razorpay_key

      if (!booking_id) {
        setError("Booking failed — no booking ID returned.")
        setPaying(false)
        return
      }


      if (!razorpay_order_id || !razorpay_key) {
        
        console.warn("Razorpay integration failed, using simulation:", bookingRes.razorpay_error)
        const payRes = await simulatePayment(booking_id)
        if (payRes.error) {
          setError(payRes.error)
          setPaying(false)
          return
        }
        
        sessionStorage.removeItem("selected_seats")
        sessionStorage.setItem("last_booking_id", String(booking_id))
        sessionStorage.setItem("last_event_title", event.title)
        sessionStorage.setItem("last_payment_amount", String(totalAmount))
        router.push(`/payment/success?booking_id=${booking_id}`)
        return
      }


      const options = {
        key: razorpay_key,
        amount: totalPaise,
        currency: "INR",
        name: event.title,
        description: `${selectedSeats.length} seat(s) booking`,
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
           
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                booking_id: String(booking_id),
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.error) {
              setError(verifyData.error)
              setPaying(false)
              return
            }

           
            sessionStorage.removeItem("selected_seats")
            sessionStorage.setItem("last_booking_id", String(booking_id))
            sessionStorage.setItem("last_event_title", event.title)
            sessionStorage.setItem("last_payment_amount", String(totalAmount))
            router.push(`/payment/success?booking_id=${booking_id}`)
          } catch (e: any) {
            setError(e.message || "Payment verification failed")
            setPaying(false)
          }
        },
        modal: {
          ondismiss: async function () {
			await releasePendingSeats(booking_id)
            setPaying(false)
            setError("Payment cancelled")
          },
        },
        theme: {
          color: "#8b5cf6",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", async function (response: any) {
		await releasePendingSeats(booking_id)
        setError(`Payment failed: ${response.error.description}`)
        setPaying(false)
      })
      rzp.open()

    } catch (e: any) {
      setError(e.message || "Something went wrong")
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-violet-400 transition mb-6 flex items-center gap-1"
        >
          ← Back to Event
        </button>

        <h1 className="text-3xl font-extrabold text-white mb-8">Checkout</h1>

        {/* Event Summary */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-6 flex gap-4">
          <img
            src={event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=80&fit=crop"}
            alt={event.title}
            className="w-24 h-16 object-cover rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-base truncate">{event.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">📍 {event.location}</p>
            <p className="text-xs text-gray-500">📅 {new Date(event.event_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {event.event_time}</p>
          </div>
        </div>

        {/* Seats */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-white mb-3">Selected Seats ({selectedSeats.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((s) => (
              <span key={s} className="bg-violet-900/50 text-violet-300 border border-violet-700/30 font-bold text-sm px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Bill Breakdown */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-white mb-4">Bill Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>{selectedSeats.length} seat(s) × ₹{event.price.toLocaleString("en-IN")}</span>
              <span className="font-medium text-gray-300">₹{baseAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
              <span className="font-medium text-gray-300">₹{platformFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST ({GST_PERCENT}%)</span>
              <span className="font-medium text-gray-300">₹{gst.toLocaleString("en-IN")}</span>
            </div>
            <hr className="border-white/5" />
            <div className="flex justify-between text-base font-extrabold">
              <span className="text-white">Total Payable</span>
              <span className="bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent text-lg">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition text-base shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 inline-block" />
              Processing...
            </>
          ) : (
            <>
              🔒 Pay ₹{totalAmount.toLocaleString("en-IN")} via Razorpay
            </>
          )}
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">Powered by Razorpay · 100% Secure Payment</p>
      </div>
    </div>
  )
}
