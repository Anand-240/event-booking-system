package config

import (
	"context"
	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

func InitRedis() *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	return rdb

}
