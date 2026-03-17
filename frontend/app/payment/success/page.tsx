"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("booking_id")
  const isSimulated = searchParams.get("simulated") === "true"
  const [eventTitle, setEventTitle] = useState("")
  const [amountPaid, setAmountPaid] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const title = sessionStorage.getItem("last_event_title") || "your event"
    const amount = sessionStorage.getItem("last_payment_amount")
    setEventTitle(title)
    if (amount) setAmountPaid(Number(amount).toLocaleString("en-IN"))

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)

    const redirect = setTimeout(() => {
      router.push("/dashboard/wallet")
    }, 8000)

    return () => { clearInterval(timer); clearTimeout(redirect) }
  }, [router])

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="relative mx-auto w-28 h-28 mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
          <div className="relative flex items-center justify-center w-28 h-28 bg-green-500 rounded-full shadow-lg">
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed! 🎉</h1>
        <p className="text-gray-600 mb-1">
          Your tickets for <span className="font-semibold text-gray-900">{eventTitle}</span> are booked.
        </p>
        {bookingId && (
          <p className="text-sm text-gray-400 mb-1">Booking ID: <span className="font-mono font-semibold">#{bookingId}</span></p>
        )}
        {isSimulated && (
          <p className="text-xs text-orange-500 mb-4">(Test mode — simulated payment)</p>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 my-6 text-left space-y-2">
          <p className="text-sm text-gray-600 flex items-center gap-2"><span>✅</span> Payment received</p>
          {amountPaid && (
            <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <span>💰</span> Amount paid: ₹{amountPaid} <span className="text-xs font-normal text-gray-400">(incl. platform fee & GST)</span>
            </p>
          )}
          <p className="text-sm text-gray-600 flex items-center gap-2"><span>🎫</span> Ticket saved to your Wallet</p>
          <p className="text-sm text-gray-600 flex items-center gap-2"><span>📱</span> QR code generated for entry</p>
          <p className="text-sm text-gray-600 flex items-center gap-2"><span>⏰</span> QR expires after event ends</p>
        </div>

        <p className="text-sm text-gray-400 mb-5">
          Redirecting to your Wallet in <span className="font-bold text-blue-600">{countdown}s</span>...
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard/wallet"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow"
          >
            🎫 View in Wallet
          </Link>
          <Link
            href="/events"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
