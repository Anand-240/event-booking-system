package main

import (
	"time"

	"event-booking-backend/internal/config"
	"event-booking-backend/internal/controllers"
	"event-booking-backend/internal/middlewares"
	"event-booking-backend/internal/repositories"
	"event-booking-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	db := config.ConnectDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	redisClient := config.InitRedis()

	eventRepo := repositories.NewEventRepository(db)
	userRepo := repositories.NewUserRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)
	waitlistRepo := repositories.NewWaitlistRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)
	seatRepo := repositories.NewSeatRepository(db)

	eventService := services.NewEventService(eventRepo, redisClient)
	authService := services.NewAuthService(userRepo, "SUPER_SECRET_KEY")
	bookingService := services.NewBookingService(
		db,
		eventRepo,
		bookingRepo,
		waitlistRepo,
		notificationRepo,
		seatRepo,
	)

	eventController := controllers.NewEventController(eventService)
	authController := controllers.NewAuthController(authService)
	razorpayService := services.NewRazorpayService()
	bookingController := controllers.NewBookingController(bookingService, razorpayService)
	paymentController := controllers.NewPaymentController(bookingRepo, eventRepo, razorpayService)
	seatController := controllers.NewSeatController(seatRepo)

	r.POST("/signup", authController.Signup)
	r.POST("/login", authController.Login)
	r.POST("/refresh", authController.Refresh)
	r.GET("/verify-email", authController.VerifyEmail)

	r.GET("/events", eventController.GetAllEvents)
	r.GET("/events/:id", eventController.GetEventByID)
	r.GET("/events/:id/seats", seatController.GetSeatsByEvent)

	protected := r.Group("/")
	protected.Use(
		middlewares.AuthMiddleware("SUPER_SECRET_KEY"),
		middlewares.RateLimitPerUser(60, time.Minute),
	)

	admin := protected.Group("/admin")
	admin.Use(middlewares.AdminOnly())
	{
		admin.POST("/events", eventController.CreateEvent)
		admin.PUT("/events/:id", eventController.UpdateEvent)
		admin.DELETE("/events/:id", eventController.DeleteEvent)
	}

	protected.POST("/events/:id/book-seats", bookingController.BookSeats)
	protected.GET("/my-bookings", bookingController.MyBookings)
	protected.DELETE("/bookings/:bookingID", bookingController.CancelBooking)
	protected.POST("/bookings/:bookingID/pay", paymentController.SimulatePayment)
	protected.POST("/bookings/:bookingID/confirm", bookingController.ConfirmPayment)
	protected.POST("/bookings/:bookingID/refund", bookingController.RefundBooking)
	protected.POST("/payments/verify", paymentController.VerifyPayment)

	r.Run(":8080")
}
