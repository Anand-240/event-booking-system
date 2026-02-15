package models

import "time"

type Booking struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	EventID   uint      `gorm:"not null" json:"event_id"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`

	Status        string `gorm:"type:varchar(50);default:'pending_payment'" json:"status"`
	PaymentStatus string `gorm:"type:varchar(50);default:'pending'" json:"payment_status"`
	OrderID       string `gorm:"type:varchar(100)" json:"order_id"`
	PaymentID     string `gorm:"type:varchar(100)" json:"payment_id"`
	Amount        int    `gorm:"not null" json:"amount"`

	User  User  `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Event Event `gorm:"foreignKey:EventID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
