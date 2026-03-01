"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Signup() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSignup = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    setLoading(true)
    setError("")

    const res = await fetch("http://localhost:8080/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const text = await res.text()
    let data: { error?: string; message?: string } = {}
    try { data = JSON.parse(text) } catch {}
    setLoading(false)

    if (res.ok) {
      setSuccess("Account created successfully! Redirecting to login...")
      setTimeout(() => router.push("/auth/login"), 1500)
    } else {
      setError(data.error || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-linear-to-br from-pink-950 via-[#0a0a0f] to-violet-950">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-violet-700/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center px-12">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Join thousands of<br />
            <span className="bg-linear-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              event-goers
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Create your free account and start booking<br />experiences that matter to you.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[["🎫", "Easy Booking"], ["🔒", "Secure Pay"], ["📱", "QR Tickets"]].map(([emoji, label]) => (
              <div key={label as string} className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🎟</span>
            <span className="font-extrabold text-xl bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">EventBook</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white">Create account</h1>
            <p className="text-gray-500 text-sm mt-1">Free forever. No credit card required.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Full Name</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500/60 focus:bg-violet-950/20 transition"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignup()}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500/60 focus:bg-violet-950/20 transition"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignup()}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500/60 focus:bg-violet-950/20 transition pr-10"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSignup()}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-xs">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-linear-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 disabled:opacity-50 transition shadow-lg shadow-pink-900/30 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
              ) : "Create Account →"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-violet-400 font-semibold hover:text-violet-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
