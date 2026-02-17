"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-black text-white">
      <Link href="/" className="font-bold text-xl">
        EventBook
      </Link>
      <div className="space-x-4">
        <Link href="/events">Events</Link>
        <Link href="/auth/login">Login</Link>
        <Link href="/auth/signup">Signup</Link>
      </div>
    </nav>
  );
}