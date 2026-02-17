"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface Event {
  id: number
  title: string
  description: string
  location: string
  event_date: string
  available_seats: number
  banner_url: string
}

interface Seat {
  id: number
  seat_number: string
  is_booked: boolean
}

export default function EventDetails() {
  const { id } = useParams()
  const router = useRouter()

  const [event, setEvent] = useState<Event | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  useEffect(() => {
    fetch(`http://localhost:8080/events/${id}`)
      .then(res => res.json())
      .then(data => setEvent(data))

    fetch(`http://localhost:8080/events/${id}/seats`)
      .then(res => res.json())
      .then(data => setSeats(data))
  }, [id])

  const toggleSeat = (seatNumber: string, isBooked: boolean) => {
    if (isBooked) return

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber))
    } else {
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  const handleBooking = async () => {
    const token = localStorage.getItem("access_token")

    const res = await fetch(
      `http://localhost:8080/events/${id}/book-seats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seats: selectedSeats }),
      }
    )

    const data = await res.json()

    if (res.ok) {
      alert("Seats booked successfully")
      router.push("/events")
    } else {
      alert(data.error)
    }
  }

  if (!event) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

      <img
        src={event.banner_url}
        className="w-full h-64 object-cover mb-4 rounded"
      />

      <p className="mb-2">{event.description}</p>
      <p className="mb-2">Location: {event.location}</p>
      <p className="mb-6">
        Available Seats: {event.available_seats}
      </p>

      <h2 className="text-xl font-semibold mb-4">Select Seats</h2>

      <div className="grid grid-cols-8 gap-3">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() =>
              toggleSeat(seat.seat_number, seat.is_booked)
            }
            className={`p-2 rounded text-sm
              ${
                seat.is_booked
                  ? "bg-gray-400 cursor-not-allowed"
                  : selectedSeats.includes(seat.seat_number)
                  ? "bg-green-500 text-white"
                  : "bg-blue-200"
              }
            `}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-6">
          <p className="mb-2">
            Selected Seats: {selectedSeats.join(", ")}
          </p>
          <p className="mb-4">
            Total: ₹{selectedSeats.length * 500}
          </p>

          <button
            onClick={handleBooking}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Proceed to Book
          </button>
        </div>
      )}
    </div>
  )
}