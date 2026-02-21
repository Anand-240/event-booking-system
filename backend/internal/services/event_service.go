package services

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type EventService struct {
	repo  *repositories.EventRepository
	redis *redis.Client
	db    *gorm.DB
}

func NewEventService(
	repo *repositories.EventRepository,
	redisClient *redis.Client,
) *EventService {
	return &EventService{
		repo:  repo,
		redis: redisClient,
		db:    repo.DB,
	}
}

func (s *EventService) CreateEvent(
	title string,
	description string,
	location string,
	eventDate time.Time,
	eventTime string,
	category string,
	seats int,
	capacity int,
	price float64,
	organizer string,
	bannerURL string,
	status string,
) error {

	if title == "" {
		return errors.New("title required")
	}

	if seats <= 0 {
		return errors.New("invalid number of seats")
	}

	if capacity <= 0 {
		capacity = seats
	}

	if status == "" {
		status = models.EventAvailable
	}

	event := &models.Event{
		Title:          title,
		Description:    description,
		Location:       location,
		EventDate:      eventDate,
		EventTime:      eventTime,
		Category:       category,
		TotalSeats:     seats,
		AvailableSeats: seats,
		Capacity:       capacity,
		Price:          price,
		Organizer:      organizer,
		BannerURL:      bannerURL,
		Status:         status,
	}

	if err := s.repo.Create(event); err != nil {
		return err
	}

	// auto-generate seats
	rows := 5
	cols := (seats + rows - 1) / rows

	if err := generateSeats(event.ID, rows, cols, seats, s.db); err != nil {
		return err
	}

	s.redis.Del(context.Background(), "events_list")

	return nil
}

func (s *EventService) GetAllEvents() ([]models.Event, error) {

	cacheKey := "events_list"
	ctx := context.Background()

	cached, err := s.redis.Get(ctx, cacheKey).Result()
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
	s.redis.Set(ctx, cacheKey, data, time.Minute*5)

	return events, nil
}

func (s *EventService) GetEventByID(id uint) (*models.Event, error) {
	return s.repo.FindByID(id)
}

func (s *EventService) UpdateEvent(event *models.Event) error {
	s.redis.Del(context.Background(), "events_list")
	return s.repo.Update(event)
}

func (s *EventService) DeleteEvent(id uint) error {
	s.redis.Del(context.Background(), "events_list")
	return s.repo.Delete(id)
}

func generateSeats(eventID uint, rows int, cols int, totalSeats int, db *gorm.DB) error {

	count := 0

	for r := 0; r < rows; r++ {
		for c := 1; c <= cols; c++ {

			if count >= totalSeats {
				return nil
			}

			seat := models.Seat{
				EventID:    eventID,
				SeatNumber: string(rune('A'+r)) + strconv.Itoa(c),
				IsBooked:   false,
			}

			if err := db.Create(&seat).Error; err != nil {
				return err
			}

			count++
		}
	}

	return nil
}

func (s *EventService) GetEvents(
	category string,
	search string,
	page int,
	limit int,
) ([]models.Event, int64, error) {

	return s.repo.FindWithFilter(category, search, page, limit)
}
