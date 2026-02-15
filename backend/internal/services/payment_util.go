package services

import (
	"crypto/rand"
	"encoding/hex"
)

func GenerateOrderID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return "order_" + hex.EncodeToString(b)
}

func GeneratePaymentID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return "pay_" + hex.EncodeToString(b)
}
