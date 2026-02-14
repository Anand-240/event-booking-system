package models

import "time"

type Event struct {
	BaseModel

	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Location       string    `json:"location"`
	EventDate      time.Time `json:"event_date"`
	TotalSeats     int       `json:"total_seats"`
	AvailableSeats int       `json:"available_seats"`
	BannerURL      string    `json:"banner_url"`
	Status         string    `gorm:"default:available" json:"status"`

	Bookings []Booking
}
