package controllers

import (
	"net/http"
	"strconv"

	"event-booking-backend/internal/repositories"

	"github.com/gin-gonic/gin"
)

type SeatController struct {
	repo *repositories.SeatRepository
}

func NewSeatController(repo *repositories.SeatRepository) *SeatController {
	return &SeatController{
		repo: repo,
	}
}

func (c *SeatController) GetSeatsByEvent(ctx *gin.Context) {

	eventIDParam := ctx.Param("id")
	eventID, err := strconv.Atoi(eventIDParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	seats, err := c.repo.FindByEventID(uint(eventID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch seats"})
		return
	}

	ctx.JSON(http.StatusOK, seats)
}
