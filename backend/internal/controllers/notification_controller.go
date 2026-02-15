package controllers

import (
	"net/http"
	"strconv"

	"event-booking-backend/internal/repositories"

	"github.com/gin-gonic/gin"
)

type NotificationController struct {
	repo *repositories.NotificationRepository
}

func NewNotificationController(repo *repositories.NotificationRepository) *NotificationController {
	return &NotificationController{repo: repo}
}

func (c *NotificationController) MyNotifications(ctx *gin.Context) {

	userIDRaw, _ := ctx.Get("userID")
	userID := uint(userIDRaw.(float64))

	notifications, err := c.repo.FindByUserID(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, notifications)
}

func (c *NotificationController) MarkAsRead(ctx *gin.Context) {

	idParam := ctx.Param("id")
	id, _ := strconv.Atoi(idParam)

	err := c.repo.MarkAsRead(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "notification marked as read"})
}
