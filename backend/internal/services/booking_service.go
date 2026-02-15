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

func (s *BookingService) BookEvent(userID uint, eventID uint, quantity int) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		var event models.Event

		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&event, eventID).Error
		if err != nil {
			return errors.New("event not found")
		}

		if event.Status == "sold_out" {
			return errors.New("event is sold out")
		}

		if quantity <= 0 {
			return errors.New("invalid quantity")
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

		booking := models.Booking{
			UserID:        userID,
			EventID:       eventID,
			Quantity:      quantity,
			Status:        "pending_payment",
			PaymentStatus: "pending",
			OrderID:       GenerateOrderID(),
			Amount:        quantity * 1000,
		}

		if err := tx.Create(&booking).Error; err != nil {
			return err
		}

		return nil
	})
}

func (s *BookingService) MyBookings(userID uint) ([]models.Booking, error) {
	return s.bookingRepo.FindByUserID(userID)
}

func (s *BookingService) CancelBooking(bookingID uint, userID uint) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		var booking models.Booking

		err := tx.First(&booking, bookingID).Error
		if err != nil {
			return errors.New("booking not found")
		}

		if booking.UserID != userID {
			return errors.New("unauthorized")
		}

		if booking.Status == "cancelled" {
			return errors.New("already cancelled")
		}

		var event models.Event
		if err := tx.First(&event, booking.EventID).Error; err != nil {
			return err
		}

		event.AvailableSeats += booking.Quantity

		if event.AvailableSeats > 0 {
			event.Status = "available"
		}

		if err := tx.Save(&event).Error; err != nil {
			return err
		}

		booking.Status = "cancelled"
		booking.PaymentStatus = "refunded"

		if err := tx.Save(&booking).Error; err != nil {
			return err
		}

		return nil
	})
}
