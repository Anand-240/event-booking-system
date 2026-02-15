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

		booking := &models.Booking{
			UserID:        userID,
			EventID:       eventID,
			Quantity:      quantity,
			Status:        models.StatusPendingPayment,
			PaymentStatus: models.PaymentPending,
			OrderID:       GenerateOrderID(),
			Amount:        quantity * 500,
		}

		if err := tx.Create(booking).Error; err != nil {
			return err
		}

		return nil
	})
}

func (s *BookingService) MyBookings(userID uint) ([]models.Booking, error) {
	return s.bookingRepo.FindByUserID(userID)
}

func (s *BookingService) ConfirmPayment(bookingID uint) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		var booking models.Booking

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&booking, bookingID).Error; err != nil {
			return errors.New("booking not found")
		}

		if booking.Status != models.StatusPendingPayment {
			return errors.New("invalid state transition")
		}

		booking.Status = models.StatusConfirmed
		booking.PaymentStatus = models.PaymentPaid
		booking.PaymentID = GeneratePaymentID()

		return tx.Save(&booking).Error
	})
}

func (s *BookingService) CancelBooking(bookingID uint, userID uint) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		var booking models.Booking

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&booking, bookingID).Error; err != nil {
			return errors.New("booking not found")
		}

		if booking.UserID != userID {
			return errors.New("unauthorized")
		}

		if booking.Status != models.StatusConfirmed {
			return errors.New("only confirmed bookings can be cancelled")
		}

		var event models.Event

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&event, booking.EventID).Error; err != nil {
			return err
		}

		event.AvailableSeats += booking.Quantity
		event.Status = "available"

		if err := tx.Save(&event).Error; err != nil {
			return err
		}

		booking.Status = models.StatusCancelled
		booking.PaymentStatus = models.PaymentPaid

		return tx.Save(&booking).Error
	})
}

func (s *BookingService) RefundBooking(bookingID uint) error {

	return s.db.Transaction(func(tx *gorm.DB) error {

		var booking models.Booking

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&booking, bookingID).Error; err != nil {
			return errors.New("booking not found")
		}

		if booking.Status != models.StatusCancelled {
			return errors.New("only cancelled bookings can be refunded")
		}

		booking.Status = models.StatusRefunded
		booking.PaymentStatus = models.PaymentRefunded

		return tx.Save(&booking).Error
	})
}
