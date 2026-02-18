"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EventDetails() {
  const params = useParams()
  const id = params.id

  const [event, setEvent] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  useEffect(() => {
    if (!id) return

    const fetchEvent = async () => {
      const res = await fetch(`http://localhost:8080/events/${id}`)
      const data = await res.json()
      setEvent(data)
    }

    const fetchSeats = async () => {
      const res = await fetch(`http://localhost:8080/events/${id}/seats`)
      const data = await res.json()
      setSeats(data)
    }

    fetchEvent()
    fetchSeats()
  }, [id])

  const toggleSeat = (seatNumber: string, isBooked: boolean) => {
    if (isBooked) return

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber))
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
        body: JSON.stringify({
          seats: selectedSeats,
        }),
      }
    )

    const data = await res.json()

    if (res.ok) {
      alert("Seats booked successfully")
      setSelectedSeats([])
    } else {
      alert(data.error || "Booking failed")
    }
  }

  if (!event) return <div className="p-10">Loading...</div>

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="mb-2">{event.description}</p>
      <p className="mb-2">Location: {event.location}</p>
      <p className="mb-6">
        Date: {new Date(event.event_date).toLocaleDateString()}
      </p>

      <h2 className="text-xl font-semibold mb-4">Select Seats</h2>

      <div className="grid grid-cols-8 gap-2">
        {seats.map((seat) => (
          <div
            key={seat.id}
            onClick={() => toggleSeat(seat.seat_number, seat.is_booked)}
            className={`p-2 text-center rounded cursor-pointer text-sm
              ${
                seat.is_booked
                  ? "bg-red-500 text-white"
                  : selectedSeats.includes(seat.seat_number)
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
          >
            {seat.seat_number}
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-6">
          <p className="mb-2">
            Selected Seats: {selectedSeats.join(", ")}
          </p>

          <button
            onClick={handleBooking}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Book Selected Seats
          </button>
        </div>
      )}
    </div>
  )
}