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
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Location    string  `json:"location"`
		Date        string  `json:"date"`
		Time        string  `json:"event_time"`
		Category    string  `json:"category"`
		Seats       int     `json:"seats"`
		Capacity    int     `json:"capacity"`
		Price       float64 `json:"price"`
		Organizer   string  `json:"organizer"`
		BannerURL   string  `json:"banner_url"`
		Status      string  `json:"status"`
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
		body.Time,
		body.Category,
		body.Seats,
		body.Capacity,
		body.Price,
		body.Organizer,
		body.BannerURL,
		body.Status,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "event created successfully"})
}

func (c *EventController) GetAllEvents(ctx *gin.Context) {

	category := ctx.Query("category")
	search := ctx.Query("search")

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "12"))

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 12
	}

	events, total, err := c.service.GetEvents(category, search, page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch events"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"page":   page,
		"limit":  limit,
		"total":  total,
		"events": events,
	})
}

func (c *EventController) GetEventByID(ctx *gin.Context) {

	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	event, err := c.service.GetEventByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"event": event})
}

func (c *EventController) UpdateEvent(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	var body struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Location    string  `json:"location"`
		Date        string  `json:"date"`
		Time        string  `json:"event_time"`
		Category    string  `json:"category"`
		Seats       int     `json:"seats"`
		Capacity    int     `json:"capacity"`
		Price       float64 `json:"price"`
		Organizer   string  `json:"organizer"`
		BannerURL   string  `json:"banner_url"`
		Status      string  `json:"status"`
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
	if body.Category != "" {
		event.Category = body.Category
	}
	if body.Status != "" {
		event.Status = body.Status
	}
	if body.Time != "" {
		event.EventTime = body.Time
	}
	if body.Organizer != "" {
		event.Organizer = body.Organizer
	}
	if body.Price > 0 {
		event.Price = body.Price
	}
	if body.Capacity > 0 {
		event.Capacity = body.Capacity
	}
	if body.Date != "" {
		date, err := time.Parse("2006-01-02", body.Date)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
			return
		}
		event.EventDate = date
	}
	if body.Seats > 0 {
		event.TotalSeats = body.Seats
		event.AvailableSeats = body.Seats
	}
	if body.BannerURL != "" {
		event.BannerURL = body.BannerURL
	}

	err = c.service.UpdateEvent(event)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update event"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "event updated successfully"})
}

func (c *EventController) DeleteEvent(ctx *gin.Context) {

	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	err = c.service.DeleteEvent(uint(id))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "event deleted successfully"})
}
