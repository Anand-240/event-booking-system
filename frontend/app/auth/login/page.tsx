"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return }
    setLoading(true)
    setError("")

    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || "Login failed"); return }

    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
    if (data.user) {
      localStorage.setItem("auth_user", JSON.stringify(data.user))
      localStorage.setItem("role", data.user.role || "user")
    }
    window.dispatchEvent(new Event("storage"))
    router.push(data.user?.role === "admin" ? "/admin/events" : "/events")
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-linear-to-br from-violet-950 via-[#0a0a0f] to-pink-950">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-700/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center px-12">
          <div className="text-6xl mb-6">🎟</div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Your next event<br />
            <span className="bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              awaits you
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Book tickets, track your events, and carry all<br />your tickets in one beautiful wallet.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {["🎵 Music", "⚽ Sports", "💻 Tech", "😂 Comedy", "🎨 Art", "🍕 Food"].map(t => (
              <span key={t} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-400">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo (mobile only) */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🎟</span>
            <span className="font-extrabold text-xl bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">EventBook</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500/60 focus:bg-violet-950/20 transition"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500/60 focus:bg-violet-950/20 transition pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-xs"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 transition shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : "Sign In →"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-violet-400 font-semibold hover:text-violet-300 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

