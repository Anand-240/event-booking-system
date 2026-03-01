package controllers

import (
	"net/http"
	"strconv"

	"event-booking-backend/internal/repositories"
	"event-booking-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type PaymentController struct {
	bookingRepo     *repositories.BookingRepository
	eventRepo       *repositories.EventRepository
	razorpayService *services.RazorpayService
}

func NewPaymentController(
	bookingRepo *repositories.BookingRepository,
	eventRepo *repositories.EventRepository,
	razorpayService *services.RazorpayService,
) *PaymentController {
	return &PaymentController{
		bookingRepo:     bookingRepo,
		eventRepo:       eventRepo,
		razorpayService: razorpayService,
	}
}

func (c *PaymentController) VerifyPayment(ctx *gin.Context) {

	var body struct {
		BookingID string `json:"booking_id"`
		OrderID   string `json:"razorpay_order_id"`
		PaymentID string `json:"razorpay_payment_id"`
		Signature string `json:"razorpay_signature"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if !c.razorpayService.VerifySignature(body.OrderID, body.PaymentID, body.Signature) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment signature"})
		return
	}

	bookingID, err := strconv.Atoi(body.BookingID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	booking, err := c.bookingRepo.FindByID(uint(bookingID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	booking.PaymentID = body.PaymentID
	booking.RazorpayOrderID = body.OrderID
	booking.PaymentStatus = "paid"
	booking.Status = "confirmed"

	if err := c.bookingRepo.Update(booking); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update booking"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":    "payment verified and booking confirmed",
		"booking_id": booking.ID,
	})
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
		"booking_id": booking.ID,
	})
}
