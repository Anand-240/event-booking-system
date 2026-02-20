package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() *gorm.DB {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system env variables")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	name := os.Getenv("DB_NAME")
	ssl := os.Getenv("DB_SSL")

	if host == "" {
		log.Fatal("DB_HOST is missing in .env")
	}
	if user == "" {
		log.Fatal("DB_USER is missing in .env")
	}
	if pass == "" {
		log.Fatal("DB_PASS is missing in .env")
	}
	if name == "" {
		log.Fatal("DB_NAME is missing in .env")
	}
	if port == "" {
		port = "5432"
	}

	dsn :=
		fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			host, user, pass, name, port, ssl,
		)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL:", err)
	}

	DB = db
	log.Println("Connected to PostgreSQL successfully!")
	return db
}
