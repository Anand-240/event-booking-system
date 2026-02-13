package controllers

import (
	"net/http"
	"strconv"
	"time"

	"event-booking-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type EventController struct {
	service *services.EventService
}

func NewEventController(service *services.EventService) *EventController {
	return &EventController{service: service}
}

func (c *EventController) CreateEvent(ctx *gin.Context) {

	var body struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Location    string `json:"location"`
		Date        string `json:"date"`
		Seats       int    `json:"seats"`
		BannerURL   string `json:"banner_url"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	eventDate, err := time.Parse("2006-01-02", body.Date)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format (use YYYY-MM-DD)"})
		return
	}

	err = c.service.CreateEvent(
		body.Title,
		body.Description,
		body.Location,
		eventDate,
		body.Seats,
		body.BannerURL,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "event created successfully",
	})
}

func (c *EventController) GetAllEvents(ctx *gin.Context) {

	events, err := c.service.GetAllEvents()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch events"})
		return
	}

	ctx.JSON(http.StatusOK, events)
}

func (c *EventController) GetEventByID(ctx *gin.Context) {

	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	event, err := c.service.GetEventByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	ctx.JSON(http.StatusOK, event)
}

func (c *EventController) UpdateEvent(ctx *gin.Context) {

	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var body struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Location    string `json:"location"`
		Date        string `json:"date"`
		Seats       int    `json:"seats"`
		BannerURL   string `json:"banner_url"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	event, err := c.service.GetEventByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	if body.Title != "" {
		event.Title = body.Title
	}
	if body.Description != "" {
		event.Description = body.Description
	}
	if body.Location != "" {
		event.Location = body.Location
	}
	if body.Seats > 0 {
		event.TotalSeats = body.Seats
		event.AvailableSeats = body.Seats
	}
	if body.BannerURL != "" {
		event.BannerURL = body.BannerURL
	}
	if body.Date != "" {
		eventDate, err := time.Parse("2006-01-02", body.Date)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
			return
		}
		event.EventDate = eventDate
	}

	err = c.service.UpdateEvent(event)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update event"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "event updated successfully",
	})
}

func (c *EventController) DeleteEvent(ctx *gin.Context) {

	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	err = c.service.DeleteEvent(uint(id))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "event deleted successfully",
	})
}
