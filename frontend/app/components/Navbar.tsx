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
    `relative rounded-full px-3 py-2 text-sm font-semibold transition-all duration-150 ${
      isActive(href)
        ? "bg-white/8 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#08101b]/88 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.35)] border-b border-white/8"
          : "bg-transparent"
      }`}
    >
      <div className="shell-container flex h-18 items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-orange-500/30 via-rose-500/20 to-sky-500/20 text-base shadow-lg shadow-orange-900/20">
            🎟
          </span>
          <span className="font-extrabold text-xl bg-linear-to-r from-orange-300 via-rose-300 to-sky-300 bg-clip-text text-transparent tracking-tight">
            EventBook
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/8 bg-white/4 p-1.5 backdrop-blur-sm">
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
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-orange-900/30">
                  {userName ? userName[0].toUpperCase() : "U"}
                </div>
                <span className="text-gray-300 text-sm">{userName || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-linear-to-r from-orange-500 via-rose-500 to-sky-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:brightness-110"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:text-white md:hidden"
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
        <div className="md:hidden border-t border-white/5 bg-[#09111c]/96 px-5 py-4 flex flex-col gap-4 backdrop-blur-xl">
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
