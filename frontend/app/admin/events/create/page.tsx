"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Music");
  const [seats, setSeats] = useState(50);
  const [bannerURL, setBannerURL] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);

    const res = await fetch("http://localhost:8080/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        title,
        description,
        location,
        date,           
        category,
        seats,
        banner_url: bannerURL,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Event Created Successfully!");
      router.push("/events");
    } else {
      alert(data.error || "Failed to create event");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Event</h1>

      <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-lg space-y-6">
        <input
          type="text"
          placeholder="Event Title"
          className="border p-3 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Event Description"
          className="border p-3 w-full rounded h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          className="border p-3 w-full rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="date"
          className="border p-3 rounded w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          className="border p-3 rounded w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Tech">Tech</option>
          <option value="Comedy">Comedy</option>
          <option value="Conference">Conference</option>
        </select>

        <input
          type="number"
          placeholder="Total Seats"
          className="border p-3 w-full rounded"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
        />

        <input
          type="text"
          placeholder="Banner Image URL"
          className="border p-3 w-full rounded"
          value={bannerURL}
          onChange={(e) => setBannerURL(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded w-full hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
}