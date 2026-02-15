package services

import (
	"errors"

	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookingService struct {
	db           *gorm.DB
	eventRepo    *repositories.EventRepository
	bookingRepo  *repositories.BookingRepository
	waitlistRepo *repositories.WaitlistRepository
}

func NewBookingService(
	db *gorm.DB,
	eventRepo *repositories.EventRepository,
	bookingRepo *repositories.BookingRepository,
	waitlistRepo *repositories.WaitlistRepository,
) *BookingService {
	return &BookingService{
		db:           db,
		eventRepo:    eventRepo,
		bookingRepo:  bookingRepo,
		waitlistRepo: waitlistRepo,
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

		if quantity <= 0 {
			return errors.New("invalid quantity")
		}

		if event.AvailableSeats < quantity {
			return s.waitlistRepo.Add(userID, eventID)
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

		return tx.Create(booking).Error
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

		if err := tx.Save(&booking).Error; err != nil {
			return err
		}

		nextWait, err := s.waitlistRepo.GetNext(event.ID)
		if err == nil && event.AvailableSeats > 0 {

			event.AvailableSeats -= 1

			newBooking := &models.Booking{
				UserID:        nextWait.UserID,
				EventID:       event.ID,
				Quantity:      1,
				Status:        models.StatusConfirmed,
				PaymentStatus: models.PaymentPaid,
				OrderID:       GenerateOrderID(),
				Amount:        500,
			}

			tx.Save(&event)
			tx.Create(newBooking)
			s.waitlistRepo.Delete(nextWait.ID)
		}

		return nil
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
