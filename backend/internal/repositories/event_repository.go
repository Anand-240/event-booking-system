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

	err := r.DB.
		Order("event_date ASC").
		Order("event_time ASC").
		Find(&events).
		Error

	return events, err
}

func (r *EventRepository) FindByID(id uint) (*models.Event, error) {
	var event models.Event
	err := r.DB.First(&event, id).Error

	if err == gorm.ErrRecordNotFound {
		return nil, err
	}

	return &event, err
}

func (r *EventRepository) FindWithFilter(
	category string,
	search string,
	page int,
	limit int,
) ([]models.Event, int64, error) {

	var events []models.Event
	var total int64

	query := r.DB.Model(&models.Event{})

	// ----- Category Filter -----
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	// ----- Search (title + location + category) -----
	if search != "" {
		searchLike := "%" + search + "%"
		query = query.Where(
			"title LIKE ? OR location LIKE ? OR category LIKE ?",
			searchLike, searchLike, searchLike,
		)
	}

	query.Count(&total)

	offset := (page - 1) * limit

	err := query.
		Order("event_date ASC").
		Order("event_time ASC").
		Limit(limit).
		Offset(offset).
		Find(&events).
		Error

	return events, total, err
}

func (r *EventRepository) Update(event *models.Event) error {
	return r.DB.Save(event).Error
}

func (r *EventRepository) Delete(id uint) error {
	return r.DB.Delete(&models.Event{}, id).Error
}
