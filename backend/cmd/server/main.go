package main

import (
	"time"

	"event-booking-backend/internal/config"
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
		&models.Waitlist{},
		&models.Notification{},
	)

	r := gin.Default()

	redisClient := config.InitRedis()

	eventRepo := repositories.NewEventRepository(db)
	userRepo := repositories.NewUserRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)
	waitlistRepo := repositories.NewWaitlistRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)

	eventService := services.NewEventService(eventRepo, redisClient)
	authService := services.NewAuthService(userRepo, "SUPER_SECRET_KEY")

	bookingService := services.NewBookingService(
		db,
		eventRepo,
		bookingRepo,
		waitlistRepo,
		notificationRepo,
	)

	eventController := controllers.NewEventController(eventService)
	authController := controllers.NewAuthController(authService)
	bookingController := controllers.NewBookingController(bookingService)
	paymentController := controllers.NewPaymentController(bookingRepo, eventRepo)
	notificationController := controllers.NewNotificationController(notificationRepo)

	r.POST("/signup", authController.Signup)
	r.POST("/login", authController.Login)
	r.POST("/refresh", authController.Refresh)
	r.GET("/verify-email", authController.VerifyEmail)

	r.GET("/events", eventController.GetAllEvents)
	r.GET("/events/:id", eventController.GetEventByID)

	protected := r.Group("/events")
	protected.Use(
		middlewares.AuthMiddleware("SUPER_SECRET_KEY"),
		middlewares.RateLimitPerUser(5, time.Minute),
	)

	{
		adminRoutes := protected.Group("/")
		adminRoutes.Use(middlewares.AdminOnly())
		{
			adminRoutes.POST("/", eventController.CreateEvent)
			adminRoutes.PUT("/:id", eventController.UpdateEvent)
			adminRoutes.DELETE("/:id", eventController.DeleteEvent)
		}

		protected.POST("/:id/book", bookingController.BookEvent)
		protected.GET("/my-bookings", bookingController.MyBookings)
		protected.DELETE("/bookings/:bookingID", bookingController.CancelBooking)
		protected.POST("/bookings/:bookingID/pay", paymentController.SimulatePayment)
		protected.POST("/bookings/:bookingID/confirm", bookingController.ConfirmPayment)
		protected.POST("/bookings/:bookingID/refund", bookingController.RefundBooking)

		protected.GET("/notifications", notificationController.MyNotifications)
		protected.POST("/notifications/:id/read", notificationController.MarkAsRead)
	}

	r.Run(":8080")
}
