"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      localStorage.setItem("token", data.access_token)
      alert("Login successful")
      router.push("/events")
    } else {
      alert(data.error || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-6">Login</h2>

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
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-64"
      >
        Login
      </button>

      <p className="mt-4 text-sm">
        Don’t have an account?{" "}
        <span
          onClick={() => router.push("/auth/signup")}
          className="text-green-600 cursor-pointer"
        >
          Signup
        </span>
      </p>
    </div>
  )
}