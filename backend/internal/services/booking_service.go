package services

import (
	"errors"

	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"
	"gorm.io/gorm"
)

type BookingService struct {
	db          *gorm.DB
	eventRepo   *repositories.EventRepository
	bookingRepo *repositories.BookingRepository
}

func NewBookingService(
	db *gorm.DB,
	eventRepo *repositories.EventRepository,
	bookingRepo *repositories.BookingRepository,
) *BookingService {
	return &BookingService{
		db:          db,
		eventRepo:   eventRepo,
		bookingRepo: bookingRepo,
	}
}

func (s *BookingService) BookEvent(userID, eventID uint) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		event, err := s.eventRepo.FindByID(eventID)
		if err != nil {
			return errors.New("event not found")
		}

		if event.AvailableSeats <= 0 {
			return errors.New("no seats available")
		}

		event.AvailableSeats--

		if err := tx.Save(event).Error; err != nil {
			return err
		}

		booking := &models.Booking{
			UserID:  userID,
			EventID: eventID,
		}

		return s.bookingRepo.Create(tx, booking)
	})
}

func (s *BookingService) GetUserBookings(userID uint) ([]models.Booking, error) {
	return s.bookingRepo.FindByUserID(userID)
}

func (s *BookingService) CancelBooking(userID, bookingID uint) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		booking, err := s.bookingRepo.FindByID(tx, bookingID)
		if err != nil {
			return errors.New("booking not found")
		}

		if booking.UserID != userID {
			return errors.New("unauthorized")
		}

		event, err := s.eventRepo.FindByID(booking.EventID)
		if err != nil {
			return errors.New("event not found")
		}

		event.AvailableSeats++

		if err := tx.Save(event).Error; err != nil {
			return err
		}

		return s.bookingRepo.Delete(tx, booking)
	})
}
