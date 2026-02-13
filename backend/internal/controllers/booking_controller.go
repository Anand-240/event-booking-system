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

	userIDRaw, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := uint(userIDRaw.(float64))

	eventIDParam := ctx.Param("id")
	eventIDInt, err := strconv.Atoi(eventIDParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	err = c.service.BookEvent(userID, uint(eventIDInt))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "event booked successfully"})
}

func (c *BookingController) MyBookings(ctx *gin.Context) {

	userIDRaw, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	userID := uint(userIDRaw.(float64))

	bookings, err := c.service.GetUserBookings(userID)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "failed to fetch bookings"})
		return
	}

	ctx.JSON(200, bookings)
}
