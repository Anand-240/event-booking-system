"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <nav className="flex justify-between items-center p-4 bg-black text-white">
      <Link href="/" className="font-bold text-xl">
        EventBook
      </Link>

      <div className="space-x-4">
        <Link href="/events">Events</Link>

        {role === "admin" && (
          <Link
            href="/admin/events/create"
            className="bg-green-500 px-3 py-1 rounded"
          >
            Add Event
          </Link>
        )}

        {!role && (
          <>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/signup">Signup</Link>
          </>
        )}

        {role && (
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/auth/login";
            }}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}