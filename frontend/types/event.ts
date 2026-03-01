export interface Seat {
  id: number
  event_id: number
  seat_number: string
  is_booked: boolean
  booking_id?: number
}

export interface Event {
  id: number
  title: string
  description: string
  location: string
  event_date: string
  event_time: string
  duration_mins: number
  category: string
  total_seats: number
  available_seats: number
  capacity: number
  price: number
  organizer: string
  banner_url: string
  status: string
  created_at: string
  updated_at: string
}