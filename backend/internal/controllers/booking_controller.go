package controllers

import (
	"net/http"
	"strconv"

	"event-booking-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type BookingController struct {
	service *services.BookingService
}

func NewBookingController(service *services.BookingService) *BookingController {
	return &BookingController{service: service}
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

	err = c.service.BookSeats(userID, uint(eventID), body.Seats)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "seats booked successfully"})
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
