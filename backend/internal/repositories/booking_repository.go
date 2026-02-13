package repositories

import (
	"event-booking-backend/internal/models"
	"gorm.io/gorm"
)

type BookingRepository struct {
	DB *gorm.DB
}

func NewBookingRepository(db *gorm.DB) *BookingRepository {
	return &BookingRepository{DB: db}
}

func (r *BookingRepository) Create(tx *gorm.DB, booking *models.Booking) error {
	return tx.Create(booking).Error
}
