package models

type User struct {
	BaseModel

	Name     string `json:"name"`
	Email    string `gorm:"uniqueIndex" json:"email"`
	Password string `json:"-"`
	Role     string `gorm:"default:user" json:"role"`

	Bookings      []Booking
	Notifications []Notification
}
