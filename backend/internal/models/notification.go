package models

type Notification struct {
	BaseModel

	UserID  uint   `json:"user_id"`
	Message string `json:"message"`
	Read    bool   `gorm:"default:false" json:"read"`

	User User
}
