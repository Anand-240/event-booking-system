package services

import (
	"encoding/json"
	"errors"
	"time"

	"event-booking-backend/internal/config"
	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"

	"fmt"
	"github.com/redis/go-redis/v9"
)

type EventService struct {
	repo  *repositories.EventRepository
	redis *redis.Client
}

func NewEventService(repo *repositories.EventRepository, rdb *redis.Client) *EventService {
	return &EventService{
		repo:  repo,
		redis: rdb,
	}
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

	err := s.repo.Create(event)
	if err != nil {
		return err
	}

	s.redis.Del(config.Ctx, "events_list")

	return nil
}

func (s *EventService) GetAllEvents() ([]models.Event, error) {

	cacheKey := "events_list"

	cached, err := s.redis.Get(config.Ctx, cacheKey).Result()
	if err == nil {
		var events []models.Event
		json.Unmarshal([]byte(cached), &events)
		return events, nil
	}

	events, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	data, _ := json.Marshal(events)
	s.redis.Set(config.Ctx, cacheKey, data, time.Minute*5)

	return events, nil
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

	cacheKey := "events:" + category + ":" + search + ":" +
		fmt.Sprintf("%d:%d", page, limit)

	cached, err := s.redis.Get(config.Ctx, cacheKey).Result()
	if err == nil {
		var result struct {
			Events []models.Event
			Total  int64
		}
		json.Unmarshal([]byte(cached), &result)
		return result.Events, result.Total, nil
	}

	events, total, err := s.repo.FindWithFilter(category, search, page, limit)
	if err != nil {
		return nil, 0, err
	}

	payload := struct {
		Events []models.Event
		Total  int64
	}{
		Events: events,
		Total:  total,
	}

	data, _ := json.Marshal(payload)
	s.redis.Set(config.Ctx, cacheKey, data, time.Minute*5)

	return events, total, nil
}

func (s *EventService) UpdateEvent(event *models.Event) error {

	err := s.repo.Update(event)
	if err != nil {
		return err
	}

	s.redis.Del(config.Ctx, "events_list")

	return nil
}

func (s *EventService) DeleteEvent(id uint) error {

	err := s.repo.Delete(id)
	if err != nil {
		return err
	}

	s.redis.Del(config.Ctx, "events_list")

	return nil
}
