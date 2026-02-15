package repositories

import (
	"event-booking-backend/internal/models"
	"gorm.io/gorm"
)

type WaitlistRepository struct {
	DB *gorm.DB
}

func NewWaitlistRepository(db *gorm.DB) *WaitlistRepository {
	return &WaitlistRepository{DB: db}
}

func (r *WaitlistRepository) Add(userID, eventID uint) error {
	wait := models.Waitlist{
		UserID:  userID,
		EventID: eventID,
	}
	return r.DB.Create(&wait).Error
}

func (r *WaitlistRepository) GetNext(eventID uint) (*models.Waitlist, error) {
	var wait models.Waitlist
	err := r.DB.
		Where("event_id = ?", eventID).
		Order("created_at ASC").
		First(&wait).Error
	return &wait, err
}

func (r *WaitlistRepository) Delete(id uint) error {
	return r.DB.Delete(&models.Waitlist{}, id).Error
}
