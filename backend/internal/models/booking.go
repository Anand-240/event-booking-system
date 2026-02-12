package models

type Booking struct {
	BaseModel

	UserID  uint `json:"user_id"`
	EventID uint `json:"event_id"`

	Quantity int    `json:"quantity"`
	Status   string `gorm:"default:confirmed" json:"status"`
	User     User
	Event    Event
}
