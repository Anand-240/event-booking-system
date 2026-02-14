package services

import (
	"crypto/rand"
	"encoding/hex"
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

func generateToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *AuthService) Signup(name, email, password string) error {

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	verificationToken := generateToken()

	user := &models.User{
		Name:              name,
		Email:             email,
		Password:          string(hashed),
		Role:              "user",
		IsVerified:        false,
		VerificationToken: verificationToken,
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return err
	}

	println("Verify your email at:")
	println("http://localhost:8080/verify-email?token=" + verificationToken)

	return nil
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

	if !user.IsVerified {
		return "", "", errors.New("email not verified")
	}

	accessClaims := jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Minute * 15).Unix(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessString, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", errors.New("failed to generate access token")
	}

	refreshClaims := jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(),
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshString, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", errors.New("failed to generate refresh token")
	}

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

func (s *AuthService) VerifyEmail(token string) error {

	user, err := s.userRepo.FindByVerificationToken(token)
	if err != nil {
		return errors.New("invalid token")
	}

	user.IsVerified = true
	user.VerificationToken = ""

	return s.userRepo.Update(user)
}
