package models

type Seat struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	EventID    uint   `json:"event_id"`
	SeatNumber string `json:"seat_number"`
	IsBooked   bool   `json:"is_booked"`
	BookingID  *uint  `json:"booking_id"`

	Event Event `gorm:"foreignKey:EventID"`
}
