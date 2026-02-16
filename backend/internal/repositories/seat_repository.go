package repositories

import (
	"event-booking-backend/internal/models"

	"gorm.io/gorm"
)

type SeatRepository struct {
	DB *gorm.DB
}

func NewSeatRepository(db *gorm.DB) *SeatRepository {
	return &SeatRepository{
		DB: db,
	}
}

func (r *SeatRepository) FindByEventID(eventID uint) ([]models.Seat, error) {
	var seats []models.Seat
	err := r.DB.Where("event_id = ?", eventID).
		Order("seat_number ASC").
		Find(&seats).Error

	return seats, err
}
