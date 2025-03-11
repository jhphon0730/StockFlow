package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

func TestRegisterSuccess(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := SetupTestDB()
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	router := gin.Default()
	router.POST("/register", userHandler.SignUpUser)

	payload := dto.SignUpUserDTO{
		Name:     "TestUser",
		Email:    "testuser@example.com",
		Password: "password123!",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", "/register", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status %v, got %v", http.StatusCreated, rr.Code)
	}

	var resp utils.Response
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Errorf("Failed to parse JSON response: %v", err)
	}

	if resp.Data == nil {
		t.Errorf("Expected data to be non-nil")
	}
}
