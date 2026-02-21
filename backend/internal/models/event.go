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
	EventTime      string    `json:"event_time"`
	Category       string    `json:"category"`
	TotalSeats     int       `json:"total_seats"`
	AvailableSeats int       `json:"available_seats"`
	Capacity       int       `json:"capacity"`
	Price          float64   `json:"price"`
	Organizer      string    `json:"organizer"`
	BannerURL      string    `json:"banner_url"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	Bookings []Booking `json:"bookings"`
}
