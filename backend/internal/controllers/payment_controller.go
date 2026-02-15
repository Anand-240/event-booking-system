package controllers

import (
	"net/http"
	"strconv"

	"event-booking-backend/internal/repositories"
	"event-booking-backend/internal/services"
	"github.com/gin-gonic/gin"
)

type PaymentController struct {
	bookingRepo *repositories.BookingRepository
	eventRepo   *repositories.EventRepository
}

func NewPaymentController(
	bookingRepo *repositories.BookingRepository,
	eventRepo *repositories.EventRepository,
) *PaymentController {
	return &PaymentController{
		bookingRepo: bookingRepo,
		eventRepo:   eventRepo,
	}
}

func (c *PaymentController) SimulatePayment(ctx *gin.Context) {

	idParam := ctx.Param("bookingID")
	id, _ := strconv.Atoi(idParam)

	booking, err := c.bookingRepo.FindByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	if booking.PaymentStatus != "pending" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "already processed"})
		return
	}

	booking.PaymentID = services.GeneratePaymentID()
	booking.PaymentStatus = "paid"
	booking.Status = "confirmed"

	c.bookingRepo.Update(booking)

	ctx.JSON(http.StatusOK, gin.H{
		"message":    "payment successful",
		"payment_id": booking.PaymentID,
	})
}
