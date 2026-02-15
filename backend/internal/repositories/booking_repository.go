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

func (r *BookingRepository) Create(booking *models.Booking) error {
	return r.DB.Create(booking).Error
}

func (r *BookingRepository) FindByUserID(userID uint) ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.DB.Preload("Event").Where("user_id = ?", userID).Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) FindByID(id uint) (*models.Booking, error) {
	var booking models.Booking
	err := r.DB.First(&booking, id).Error
	return &booking, err
}

func (r *BookingRepository) Update(booking *models.Booking) error {
	return r.DB.Save(booking).Error
}
