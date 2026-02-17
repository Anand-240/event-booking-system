"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetch(`http://localhost:8080/events/${id}`)
      .then(res => res.json())
      .then(setEvent)

    fetch(`http://localhost:8080/events/${id}/seats`)
      .then(res => res.json())
      .then(setSeats)
  }, [id])

  const toggleSeat = (seatNumber: string) => {
    if (selected.includes(seatNumber)) {
      setSelected(selected.filter(s => s !== seatNumber))
    } else {
      setSelected([...selected, seatNumber])
    }
  }

  const bookSeats = async () => {
    const token = localStorage.getItem("token")

    const res = await fetch(`http://localhost:8080/events/${id}/book-seats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ seats: selected })
    })

    const data = await res.json()
    alert(data.message || data.error)
  }

  if (!event) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">{event.title}</h1>
      <p>{event.description}</p>

      <h2 className="mt-8 mb-4 text-xl">Select Seats</h2>

      <div className="grid grid-cols-8 gap-2">
        {seats.map(seat => (
          <div
            key={seat.id}
            onClick={() => !seat.is_booked && toggleSeat(seat.seat_number)}
            className={`p-2 text-center border rounded cursor-pointer
              ${seat.is_booked ? "bg-gray-400" :
                selected.includes(seat.seat_number) ? "bg-green-500 text-white" :
                "bg-white"}`}
          >
            {seat.seat_number}
          </div>
        ))}
      </div>

      <button
        onClick={bookSeats}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Book Selected Seats
      </button>
    </div>
  )
}