"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-black">
        Event Booking System
      </h1>

      <p className="mb-8 text-gray-600">
        Book your favorite events easily
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Login
        </button>

        <button
          onClick={() => router.push("/auth/signup")}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Signup
        </button>
      </div>
    </div>
  )
}