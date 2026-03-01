"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const storedRole = localStorage.getItem("role");
      const token = localStorage.getItem("access_token");
      const user = localStorage.getItem("auth_user");
      setRole(storedRole);
      setIsLoggedIn(!!token);
      if (user) {
        try { setUserName(JSON.parse(user).name?.split(" ")[0] || ""); } catch {}
      }
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    ["access_token","refresh_token","auth_user","role"].forEach(k => localStorage.removeItem(k));
    setIsLoggedIn(false); setRole(null); setUserName("");
    router.push("/auth/login");
  };

  const isActive = (href: string) => pathname === href;

  const linkCls = (href: string) =>
    `relative py-1 text-sm font-medium transition-colors duration-150 ${
      isActive(href)
        ? "text-violet-400"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-white/5"
          : "bg-gray-950"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎟</span>
          <span className="font-extrabold text-xl bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            EventBook
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/events" className={linkCls("/events")}>Events</Link>

          {isLoggedIn && role === "user" && (
            <>
              <Link href="/dashboard/bookings" className={linkCls("/dashboard/bookings")}>My Bookings</Link>
              <Link href="/dashboard/wallet" className={linkCls("/dashboard/wallet")}>
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🎫</span> Wallet
                </span>
              </Link>
            </>
          )}

          {isLoggedIn && role === "admin" && (
            <>
              <Link href="/admin/events" className={linkCls("/admin/events")}>Manage Events</Link>
              <Link href="/admin/events/create" className={linkCls("/admin/events/create")}>+ Create</Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {userName ? userName[0].toUpperCase() : "U"}
                </div>
                <span className="text-gray-300 text-sm">{userName || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-1.5 rounded-full bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold transition shadow-lg shadow-violet-900/30"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-300 hover:text-white p-2"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-gray-950 px-5 py-4 flex flex-col gap-4">
          <Link href="/events" className="text-gray-300 hover:text-white text-sm font-medium">Events</Link>
          {isLoggedIn && role === "user" && (
            <>
              <Link href="/dashboard/bookings" className="text-gray-300 hover:text-white text-sm font-medium">My Bookings</Link>
              <Link href="/dashboard/wallet" className="text-gray-300 hover:text-white text-sm font-medium">🎫 Wallet</Link>
            </>
          )}
          {isLoggedIn && role === "admin" && (
            <>
              <Link href="/admin/events" className="text-gray-300 hover:text-white text-sm font-medium">Manage Events</Link>
              <Link href="/admin/events/create" className="text-gray-300 hover:text-white text-sm font-medium">+ Create Event</Link>
            </>
          )}
          <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-red-400 text-sm text-left font-medium">Logout</button>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm font-medium">Login</Link>
                <Link href="/auth/signup" className="text-sm px-4 py-2 rounded-full bg-linear-to-r from-violet-600 to-pink-600 text-white font-semibold text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
