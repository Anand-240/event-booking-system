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

func (r *BookingRepository) FindByUserID(userID uint) ([]models.Booking, error) {
	var bookings []models.Booking

	err := r.DB.
		Preload("Event").
		Preload("User").
		Where("user_id = ?", userID).
		Find(&bookings).Error

	return bookings, err
}
