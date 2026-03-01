import { Event, Seat } from "./event"

export interface Booking {
  id: number
  user_id: number
  event_id: number
  quantity: number
  status: string
  payment_status: string
  order_id: string
  payment_id: string
  razorpay_order_id: string
  amount: number
  created_at: string
  event: Event
  seats: Seat[]
}