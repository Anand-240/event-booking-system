package middlewares

import (
	"net/http"
	"strconv"
	"time"

	"event-booking-backend/internal/config"

	"github.com/gin-gonic/gin"
)

func RateLimitPerUser(limit int, window time.Duration) gin.HandlerFunc {

	return func(c *gin.Context) {

		userIDRaw, exists := c.Get("userID")
		if !exists {
			c.Next()
			return
		}

		userIDFloat := userIDRaw.(float64)
		userID := strconv.Itoa(int(userIDFloat))

		key := "rate:user:" + userID

		count, _ := config.RedisClient.Incr(config.Ctx, key).Result()

		if count == 1 {
			config.RedisClient.Expire(config.Ctx, key, window)
		}

		if count > int64(limit) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
