import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <h1 className="text-5xl font-bold mb-6">Book Events Easily</h1>
      <Link
        href="/events"
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
      >
        Explore Events
      </Link>
    </div>
  );
}