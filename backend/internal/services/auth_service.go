package services

import (
	"errors"
	"time"

	"event-booking-backend/internal/models"
	"event-booking-backend/internal/repositories"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo  *repositories.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo *repositories.UserRepository, secret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: secret,
	}
}

func (s *AuthService) Signup(name, email, password string) error {

	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashed),
		Role:     "user",
	}

	return s.userRepo.Create(user)
}

func (s *AuthService) Login(email, password string) (string, string, error) {

	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", "", errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", "", errors.New("invalid credentials")
	}

	accessClaims := jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Minute * 15).Unix(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessString, _ := accessToken.SignedString([]byte(s.jwtSecret))

	refreshClaims := jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(),
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshString, _ := refreshToken.SignedString([]byte(s.jwtSecret))

	user.RefreshToken = refreshString
	s.userRepo.Update(user)

	return accessString, refreshString, nil
}

func (s *AuthService) RefreshAccessToken(refreshToken string) (string, error) {

	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}

	claims := token.Claims.(jwt.MapClaims)

	userID := uint(claims["id"].(float64))

	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return "", errors.New("user not found")
	}

	if user.RefreshToken != refreshToken {
		return "", errors.New("refresh token mismatch")
	}

	newClaims := jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Minute * 15).Unix(),
	}

	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, newClaims)

	return newToken.SignedString([]byte(s.jwtSecret))
}
