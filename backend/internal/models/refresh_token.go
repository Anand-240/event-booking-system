package models

import "time"

type RefreshToken struct {
	BaseModel

	UserID    uint      `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`

	User User
}
