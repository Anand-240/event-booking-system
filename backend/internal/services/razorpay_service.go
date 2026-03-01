package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type RazorpayService struct {
	KeyID     string
	KeySecret string
}

func NewRazorpayService() *RazorpayService {
	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")

	if keyID == "" {
		keyID = "rzp_test_yourkeyhere"
	}
	if keySecret == "" {
		keySecret = "yourkeysecrethere"
	}

	return &RazorpayService{
		KeyID:     keyID,
		KeySecret: keySecret,
	}
}

type RazorpayOrderResponse struct {
	ID     string `json:"id"`
	Amount int    `json:"amount"`
	Key    string `json:"key"`
}

func (s *RazorpayService) CreateOrder(bookingID uint, amountPaise int) (*RazorpayOrderResponse, error) {
	payload := map[string]interface{}{
		"amount":   amountPaise,
		"currency": "INR",
		"receipt":  fmt.Sprintf("booking_%d", bookingID),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	credentials := base64.StdEncoding.EncodeToString([]byte(s.KeyID + ":" + s.KeySecret))
	req.Header.Set("Authorization", "Basic "+credentials)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("razorpay API unreachable: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("razorpay response parse error: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("razorpay error: %s", string(respBody))
	}

	orderID, ok := result["id"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid razorpay response: %s", string(respBody))
	}

	return &RazorpayOrderResponse{
		ID:     orderID,
		Amount: amountPaise,
		Key:    s.KeyID,
	}, nil
}

func (s *RazorpayService) VerifySignature(orderID, paymentID, signature string) bool {
	message := orderID + "|" + paymentID
	h := hmac.New(sha256.New, []byte(s.KeySecret))
	h.Write([]byte(message))
	computed := hex.EncodeToString(h.Sum(nil))
	return computed == signature
}
