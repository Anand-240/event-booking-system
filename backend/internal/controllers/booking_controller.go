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

func (c *BookingController) BookEvent(ctx *gin.Context) {

	userIDRaw, _ := ctx.Get("userID")
	userID := uint(userIDRaw.(float64))

	eventIDParam := ctx.Param("id")
	eventIDInt, _ := strconv.Atoi(eventIDParam)

	var body struct {
		Quantity int `json:"quantity"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	err := c.service.BookEvent(userID, uint(eventIDInt), body.Quantity)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "booking created, pending payment"})
}

func (c *BookingController) MyBookings(ctx *gin.Context) {

	userIDRaw, _ := ctx.Get("userID")
	userID := uint(userIDRaw.(float64))

	bookings, err := c.service.MyBookings(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch bookings"})
		return
	}

	ctx.JSON(http.StatusOK, bookings)
}

func (c *BookingController) CancelBooking(ctx *gin.Context) {

	userIDRaw, _ := ctx.Get("userID")
	userID := uint(userIDRaw.(float64))

	idParam := ctx.Param("bookingID")
	idInt, _ := strconv.Atoi(idParam)

	err := c.service.CancelBooking(uint(idInt), userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "booking cancelled"})
}
