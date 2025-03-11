package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

type Response struct {
	Error string `json:"error"`
}

func TestSignUp(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := SetupTestDB()
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	router := gin.Default()
	router.POST("/signup", userHandler.SignUpUser)

	payload := dto.SignUpUserDTO{
		Name:     "signupTestUser",
		Email:    "signupTestUser@example.com",
		Password: "signupTestUser123!",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", "/signup", bytes.NewBuffer(jsonPayload))
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

func TestSignIn(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := SetupTestDB()
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	router := gin.Default()
	router.POST("/signin", userHandler.SignInUser)

	_, err := CreateTestUser(db)
	if err != nil {
		t.Errorf("Failed to create test user: %v", err)
	}

	payload := dto.SignInUserDTO{
		Email:    "test_user@example.com",
		Password: "password123!",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", "/signin", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %v, got %v", http.StatusOK, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Token string       `json:"token"`
			User  *models.User `json:"user"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Errorf("Failed to parse JSON response: %v", err)
	}

	if resp.Error != "" {
		t.Errorf("Expected data to be noe-nil; GOT ERROR: %v", resp.Error)
	}

	if resp.Data.Token == "" {
		t.Errorf("Expected token to be non-empty")
	}

	if resp.Data.User == nil {
		t.Errorf("Expected user to be non-nil")
	}
}
