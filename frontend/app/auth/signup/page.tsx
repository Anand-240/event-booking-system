"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Signup() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {
    const res = await fetch("http://localhost:8080/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      alert("Signup successful. Please login.")
      router.push("/auth/login")
    } else {
      alert(data.error || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-6">Signup</h2>

      <input
        className="border p-2 mb-3 w-64"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 mb-3 w-64"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 mb-3 w-64"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-green-600 text-white px-4 py-2 rounded w-64"
      >
        Signup
      </button>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <span
          onClick={() => router.push("/auth/login")}
          className="text-blue-600 cursor-pointer"
        >
          Login
        </span>
      </p>
    </div>
  )
}