const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function authHeader(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : ""
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
  if (!refreshToken) return null
  try {
    const res = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newToken: string = data.access_token
    if (newToken) {
      localStorage.setItem("access_token", newToken)
      return newToken
    }
    return null
  } catch {
    return null
  }
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })


  if (res.status === 401 && typeof window !== "undefined") {
    const newToken = await refreshAccessToken()
    if (newToken) {
      const retryHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...options?.headers,
        Authorization: `Bearer ${newToken}`,
      }
      return fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders })
    }
  }

  return res
}

export async function getEvents(params?: { category?: string; search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.category && params.category !== "all") qs.append("category", params.category)
  if (params?.search) qs.append("search", params.search)
  if (params?.page) qs.append("page", String(params.page))
  if (params?.limit) qs.append("limit", String(params.limit))
  const res = await apiFetch(`/events?${qs.toString()}`)
  return res.json()
}

export async function getEvent(id: number | string) {
  const res = await apiFetch(`/events/${id}`)
  return res.json()
}

export async function getSeats(eventId: number | string) {
  const res = await apiFetch(`/events/${eventId}/seats`)
  return res.json()
}

export async function bookSeats(eventId: number | string, seats: string[]) {
  const res = await apiFetch(`/events/${eventId}/book-seats`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ seats }),
  })
  const text = await res.text()
  if (!text || text.trim() === "") return { error: "No response from server. Is the backend running?" }
  try { return JSON.parse(text) } catch { return { error: text } }
}

export async function simulatePayment(bookingId: number | string) {
  const res = await apiFetch(`/bookings/${bookingId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
  })
  const text = await res.text()
  if (!text || text.trim() === "") return { error: "No response from server" }
  try { return JSON.parse(text) } catch { return { error: text } }
}

export async function verifyPayment(data: {
  booking_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  const res = await apiFetch("/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getMyBookings() {
  const res = await apiFetch("/my-bookings", {
    headers: { "Content-Type": "application/json", ...authHeader() },
  })
  return res.json()
}
