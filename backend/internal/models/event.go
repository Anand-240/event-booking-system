package models

import "time"

const (
	EventAvailable = "available"
	EventSoldOut   = "sold_out"
)

type Event struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Location       string    `json:"location"`
	EventDate      time.Time `json:"event_date"`
	Category       string    `json:"category"`
	TotalSeats     int       `json:"total_seats"`
	AvailableSeats int       `json:"available_seats"`
	BannerURL      string    `json:"banner_url"`
	Status         string    `json:"status"`

	Bookings []Booking `json:"Bookings"`
}
