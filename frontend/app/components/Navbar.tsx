"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("access_token");

    setRole(storedRole);
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  };

  return (
    <nav className="w-full bg-black text-white py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">
          EventBook
        </Link>

        <div className="flex space-x-6 text-lg">

          <Link href="/events">Events</Link>

          {isLoggedIn && role === "user" && (
            <>
              <Link href="/my-bookings">My Bookings</Link>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </>
          )}

          {isLoggedIn && role === "admin" && (
            <>
              <Link href="/admin/events/create">Create Event</Link>
              <Link href="/admin/dashboard">Admin Dashboard</Link>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}