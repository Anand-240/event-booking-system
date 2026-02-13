package models

import "time"

type Booking struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	EventID   uint      `json:"event_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`

	User  User  `gorm:"foreignKey:UserID"`
	Event Event `gorm:"foreignKey:EventID"`
}
