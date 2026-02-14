package services

import (
	"errors"

	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

func (s *BookingService) BookEvent(userID, eventID uint, quantity int) error {

	if quantity <= 0 {
		return errors.New("quantity must be greater than 0")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {

		var event models.Event

		if err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&event, eventID).Error; err != nil {
			return errors.New("event not found")
		}

		if event.Status == "sold_out" {
			return errors.New("event is sold out")
		}

		if event.AvailableSeats < quantity {
			return errors.New("not enough seats available")
		}

		event.AvailableSeats -= quantity

		if event.AvailableSeats == 0 {
			event.Status = "sold_out"

		}

		if err := tx.Save(&event).Error; err != nil {
			return err
		}

		booking := &models.Booking{
			UserID:   userID,
			EventID:  eventID,
			Quantity: quantity,
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

		event.AvailableSeats += booking.Quantity

		if event.AvailableSeats > 0 {
			event.Status = "available"
		}
		if err := tx.Save(event).Error; err != nil {
			return err
		}

		return s.bookingRepo.Delete(tx, booking)
	})
}
