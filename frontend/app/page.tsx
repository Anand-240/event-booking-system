"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Decorative background blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-20 -right-40 w-[400px] h-[400px] rounded-full bg-pink-700/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full bg-purple-700/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-gray-300 font-medium mb-8 backdrop-blur-sm hover:bg-white/10 transition cursor-default">
            <span className="flex w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Experience the best events in your city
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Book Your Next
            <br />
            <span className="bg-linear-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Amazing Event
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover and book tickets for concerts, sports, tech conferences, comedy shows, and more. Your next unforgettable experience is just a click away.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push("/events")}
              className="group relative px-8 py-4 bg-linear-to-r from-violet-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl shadow-violet-900/40 hover:shadow-violet-900/60 hover:scale-105 transition-all duration-200 text-lg"
            >
              <span className="flex items-center gap-2">
                Browse Events
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            {!isLoggedIn && (
              <button
                onClick={() => router.push("/auth/login")}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-violet-900/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant Booking</h3>
            <p className="text-gray-400 leading-relaxed">
              Book your tickets instantly with our fast and secure payment system. Get QR codes delivered immediately.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 hover:border-pink-500/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-pink-900/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">100% Secure</h3>
            <p className="text-gray-400 leading-relaxed">
              Your payments are protected with industry-leading security. Book with confidence every time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multiple Events</h3>
            <p className="text-gray-400 leading-relaxed">
              From concerts to conferences, sports to comedy shows. Find all your favorite events in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-linear-to-r from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-extrabold bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-2">
                1000+
              </div>
              <div className="text-gray-400 font-medium">Events Listed</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-gray-400 font-medium">Tickets Sold</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-linear-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-2">
                4.9★
              </div>
              <div className="text-gray-400 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative max-w-4xl mx-auto px-6 pb-32 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Ready to get started?
        </h2>
        <p className="text-xl text-gray-400 mb-10">
          Join thousands of event-goers and never miss out again.
        </p>
        {!isLoggedIn && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/auth/signup")}
              className="px-8 py-4 bg-linear-to-r from-violet-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl shadow-violet-900/40 hover:shadow-violet-900/60 hover:scale-105 transition-all duration-200 text-lg"
            >
              Create Free Account
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-lg"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}