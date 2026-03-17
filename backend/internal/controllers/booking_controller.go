package controllers

import (
	"net/http"
	"strconv"

	"event-booking-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type BookingController struct {
	service         *services.BookingService
	razorpayService *services.RazorpayService
}

func NewBookingController(service *services.BookingService, razorpayService *services.RazorpayService) *BookingController {
	return &BookingController{service: service, razorpayService: razorpayService}
}

func (c *BookingController) BookSeats(ctx *gin.Context) {

	userID := ctx.GetUint("userID")

	eventIDParam := ctx.Param("id")
	eventID, err := strconv.Atoi(eventIDParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	var body struct {
		Seats []string `json:"seats"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	booking, err := c.service.BookSeats(userID, uint(eventID), body.Seats)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rzpOrder, rzpErr := c.razorpayService.CreateOrder(booking.ID, booking.Amount)
	if rzpErr != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"booking_id":        booking.ID,
			"amount":            booking.Amount,
			"razorpay_order_id": "",
			"razorpay_key":      "",
			"razorpay_error":    rzpErr.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":           "seats booked, proceed to payment",
		"booking_id":        booking.ID,
		"amount":            booking.Amount,
		"razorpay_order_id": rzpOrder.ID,
		"razorpay_key":      rzpOrder.Key,
	})
}

func (c *BookingController) MyBookings(ctx *gin.Context) {

	userID := ctx.GetUint("userID")

	bookings, err := c.service.MyBookings(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, bookings)
}

func (c *BookingController) ConfirmPayment(ctx *gin.Context) {

	idParam := ctx.Param("bookingID")
	bookingID, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	if err := c.service.ConfirmPayment(uint(bookingID)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "payment confirmed"})
}

func (c *BookingController) CancelPendingPayment(ctx *gin.Context) {
	userID := ctx.GetUint("userID")

	idParam := ctx.Param("bookingID")
	bookingID, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	if err := c.service.ReleasePendingBooking(uint(bookingID), userID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "pending booking cancelled and seats released"})
}

func (c *BookingController) CancelBooking(ctx *gin.Context) {

	userID := ctx.GetUint("userID")

	idParam := ctx.Param("bookingID")
	bookingID, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	if err := c.service.CancelBooking(uint(bookingID), userID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "booking cancelled"})
}

func (c *BookingController) RefundBooking(ctx *gin.Context) {

	idParam := ctx.Param("bookingID")
	bookingID, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	if err := c.service.RefundBooking(uint(bookingID)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "refund processed"})
}
