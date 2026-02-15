package models

import "time"

type Waitlist struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	EventID   uint      `gorm:"not null" json:"event_id"`
	CreatedAt time.Time `json:"created_at"`

	User  User  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Event Event `gorm:"foreignKey:EventID;constraint:OnDelete:CASCADE"`
}
