package repositories

import (
	"event-booking-backend/internal/models"
	"gorm.io/gorm"
)

type EventRepository struct {
	DB *gorm.DB
}

func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{DB: db}
}

func (r *EventRepository) Create(event *models.Event) error {
	return r.DB.Create(event).Error
}

func (r *EventRepository) FindAll() ([]models.Event, error) {
	var events []models.Event
	err := r.DB.Order("event_date ASC").Find(&events).Error
	return events, err
}

func (r *EventRepository) FindByID(id uint) (*models.Event, error) {
	var event models.Event
	err := r.DB.First(&event, id).Error
	return &event, err
}

func (r *EventRepository) Update(event *models.Event) error {
	return r.DB.Save(event).Error
}

func (r *EventRepository) Delete(id uint) error {
	return r.DB.Delete(&models.Event{}, id).Error
}
