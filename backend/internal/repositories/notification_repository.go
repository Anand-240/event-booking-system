package repositories

import (
	"event-booking-backend/internal/models"
	"gorm.io/gorm"
)

type NotificationRepository struct {
	DB *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{DB: db}
}

func (r *NotificationRepository) Create(notification *models.Notification) error {
	return r.DB.Create(notification).Error
}

func (r *NotificationRepository) FindByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&notifications).Error
	return notifications, err
}

func (r *NotificationRepository) MarkAsRead(id uint) error {
	return r.DB.Model(&models.Notification{}).
		Where("id = ?", id).
		Update("read", true).Error
}
