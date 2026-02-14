package services

import (
	"errors"
	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"
	"time"
)

type EventService struct {
	repo *repositories.EventRepository
}

func NewEventService(repo *repositories.EventRepository) *EventService {
	return &EventService{repo: repo}

}

func (s *EventService) CreateEvent(title, description, location string, eventDate time.Time, category string, seats int, bannerURL string) error {

	if title == "" {
		return errors.New("title is required")
	}

	if seats <= 0 {
		return errors.New("seats must be greater than 0")
	}

	event := &models.Event{
		Title:          title,
		Description:    description,
		Location:       location,
		EventDate:      eventDate,
		Category:       category,
		TotalSeats:     seats,
		AvailableSeats: seats,
		BannerURL:      bannerURL,
	}

	return s.repo.Create(event)
}

func (s *EventService) GetAllEvents() ([]models.Event, error) {
	return s.repo.FindAll()
}

func (s *EventService) GetEventByID(id uint) (*models.Event, error) {
	return s.repo.FindByID(id)
}

func (s *EventService) GetEvents(
	category string,
	search string,
	page int,
	limit int,
) ([]models.Event, int64, error) {

	return s.repo.FindWithFilter(category, search, page, limit)
}

func (s *EventService) UpdateEvent(event *models.Event) error {
	return s.repo.Update(event)
}

func (s *EventService) DeleteEvent(id uint) error {
	return s.repo.Delete(id)
}
