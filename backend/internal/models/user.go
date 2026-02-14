package models

type User struct {
	BaseModel

	Name              string `json:"name"`
	Email             string `gorm:"uniqueIndex" json:"email"`
	Password          string `json:"-"`
	Role              string `gorm:"default:user" json:"role"`
	RefreshToken      string `json:"refresh_token"`
	IsVerified        bool   `gorm:"default:false" json:"is_verified"`
	VerificationToken string `json:"-"`

	Bookings      []Booking
	Notifications []Notification
}
