"use client"

import Link from "next/link"

export default function AdminEventsPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin – Events</h1>

      <Link
        href="/admin/events/create"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Create Event
      </Link>

      <p className="mt-6 text-gray-500">Coming soon: Event list for admin</p>
    </div>
  )
}