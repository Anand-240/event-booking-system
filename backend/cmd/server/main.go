package main

import (
	"event-booking-backend/internal/controllers"
	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"
	"event-booking-backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {

	db, err := gorm.Open(sqlite.Open("events.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&models.Event{})

	r := gin.Default()

	eventRepo := repositories.NewEventRepository(db)
	eventService := services.NewEventService(eventRepo)
	eventController := controllers.NewEventController(eventService)

	eventRoutes := r.Group("/events")
	{
		eventRoutes.POST("/", eventController.CreateEvent)
		eventRoutes.GET("/", eventController.GetAllEvents)
		eventRoutes.GET("/:id", eventController.GetEventByID)
		eventRoutes.PUT("/:id", eventController.UpdateEvent)
		eventRoutes.DELETE("/:id", eventController.DeleteEvent)
	}

	r.Run(":8080")
}
