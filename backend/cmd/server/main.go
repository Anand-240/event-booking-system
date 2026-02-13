package main

import (
	"event-booking-backend/internal/controllers"
	"event-booking-backend/internal/middlewares"
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

	db.AutoMigrate(
		&models.Event{},
		&models.User{},
		&models.Booking{},
	)

	r := gin.Default()

	eventRepo := repositories.NewEventRepository(db)
	userRepo := repositories.NewUserRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)

	eventService := services.NewEventService(eventRepo)
	authService := services.NewAuthService(userRepo, "SUPER_SECRET_KEY")
	bookingService := services.NewBookingService(db, eventRepo, bookingRepo)

	eventController := controllers.NewEventController(eventService)
	authController := controllers.NewAuthController(authService)
	bookingController := controllers.NewBookingController(bookingService)

	r.POST("/signup", authController.Signup)
	r.POST("/login", authController.Login)

	r.GET("/events/", eventController.GetAllEvents)
	r.GET("/events/:id", eventController.GetEventByID)

	protected := r.Group("/events")
	protected.Use(middlewares.AuthMiddleware("SUPER_SECRET_KEY"))
	{
		protected.POST("/", eventController.CreateEvent)
		protected.PUT("/:id", eventController.UpdateEvent)
		protected.DELETE("/:id", eventController.DeleteEvent)
		protected.POST("/:id/book", bookingController.BookEvent)
		protected.GET("/my-bookings", bookingController.MyBookings)
	}

	r.Run(":8080")
}
