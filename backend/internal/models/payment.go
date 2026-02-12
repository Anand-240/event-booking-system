package models

type Payment struct {
	BaseModel

	UserID    uint    `json:"user_id"`
	BookingID uint    `json:"booking_id"`
	Amount    float64 `json:"amount"`
	Status    string  `json:"status"`

	Booking Booking
}
