package handlers_test

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func setupTransaction() (*gorm.DB, *gin.Engine, repositories.InventoryRepository, repositories.TransactionRepository, services.TransactionService, handlers.TransactionHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	transactionRepo := repositories.NewTransactionRepository(db)
	inventoryRepo := repositories.NewInventoryRepository(db)
	transactionService := services.NewTransactionService(transactionRepo, inventoryRepo)
	transactionHandler := handlers.NewTransactionHandler(transactionService)

	router := gin.Default()
	return db, router, inventoryRepo, transactionRepo, transactionService, transactionHandler
}

func cleanupTransaction(db *gorm.DB) {
	db.Exec("DELETE FROM transactions")
}

func TestCreateTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, _, transactionHandler := setupTransaction()
	router.POST("/transactions", transactionHandler.CreateTransaction)
	payload := dto.CreateTransactionDTO{
		InventoryID: 1,
		Quantity:    10,
		Type:        "ADJUST",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 10)

	req, err := http.NewRequest("POST", "/transactions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Transaction *models.Transaction `json:"transaction"`
		} `json:"data"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if resp.Data.Transaction.ID == 0 || resp.Data.Transaction == nil {
		t.Errorf("Expected transaction to be returned, got nil")
	}

	if resp.Data.Transaction.InventoryID != payload.InventoryID {
		t.Errorf("Expected inventory ID %d, got %d", payload.InventoryID, resp.Data.Transaction.InventoryID)
	}

	if resp.Data.Transaction.Quantity != payload.Quantity {
		t.Errorf("Expected quantity %d, got %d", payload.Quantity, resp.Data.Transaction.Quantity)
	}

	if resp.Data.Transaction.Type != payload.Type {
		t.Errorf("Expected type %s, got %s", payload.Type, resp.Data.Transaction.Type)
	}
}

func TestGetAllTransactions(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, _, transactionHandler := setupTransaction()
	router.GET("/transactions", transactionHandler.GetAllTransactions)

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 10)
	CreateTestTransaction(db, 1, "IN", 10)
	CreateTestTransaction(db, 1, "ADJUST", 20)

	req, err := http.NewRequest("GET", "/transactions", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Transactions []models.Transaction `json:"transactions"`
		} `json:"data"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if len(resp.Data.Transactions) != 2 {
		t.Fatalf("Expected 2 transactions, got %d", len(resp.Data.Transactions))
	}
}

func TestGetTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, _, transactionHandler := setupTransaction()
	router.GET("/transactions/:id", transactionHandler.GetTransaction)

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 10)
	CreateTestTransaction(db, 1, "IN", 10)

	req, err := http.NewRequest("GET", "/transactions/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Transaction *models.Transaction `json:"transaction"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if resp.Data.Transaction == nil {
		t.Fatalf("Expected transaction to be returned, got nil")
	}

	if resp.Data.Transaction.ID != 1 {
		t.Errorf("Expected transaction ID to be 1, got %d", resp.Data.Transaction.ID)
	}
}

func TestDeleteTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, _, transactionHandler := setupTransaction()
	router.DELETE("/transactions/:id", transactionHandler.DeleteTransaction)

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 10)
	CreateTestTransaction(db, 1, "IN", 10)

	req, err := http.NewRequest("DELETE", "/transactions/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rr.Code)
	}

	var transactionCount int64
	if err := db.Model(&models.Transaction{}).Count(&transactionCount).Error; err != nil {
		t.Fatalf("Failed to count transactions: %v", err)
	}

	if transactionCount != 0 {
		t.Errorf("Expected transaction count to be 0, got %d", transactionCount)
	}
}

func TestInTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, inventoryRepo, _, _, transactionHandler := setupTransaction()
	router.POST("/transactions", transactionHandler.CreateTransaction)
	payload := dto.CreateTransactionDTO{
		InventoryID: 1,
		Quantity:    10,
		Type:        "IN",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 0)

	req, err := http.NewRequest("POST", "/transactions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, rr.Code)
	}

	inventory, err := inventoryRepo.FindByID(1)
	if err != nil {
		t.Fatalf("Failed to find inventory: %v", err)
	}

	if inventory.Quantity != 10 {
		t.Errorf("Expected inventory quantity to be 10, got %d", inventory.Quantity)
	}
}

func TestOutTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, inventoryRepo, _, _, transactionHandler := setupTransaction()
	router.POST("/transactions", transactionHandler.CreateTransaction)
	payload := dto.CreateTransactionDTO{
		InventoryID: 1,
		Quantity:    5,
		Type:        "OUT",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 5)

	req, err := http.NewRequest("POST", "/transactions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, rr.Code)
	}

	inventory, err := inventoryRepo.FindByID(1)
	if err != nil {
		t.Fatalf("Failed to find inventory: %v", err)
	}

	if inventory.Quantity != 0 {
		t.Errorf("Expected inventory quantity to be 10, got %d", inventory.Quantity)
	}
}

func TestAdjustTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, inventoryRepo, _, _, transactionHandler := setupTransaction()
	router.POST("/transactions", transactionHandler.CreateTransaction)
	payload := dto.CreateTransactionDTO{
		InventoryID: 1,
		Quantity:    30,
		Type:        "ADJUST",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	cleanupTransaction(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, 1, 1, 5)

	req, err := http.NewRequest("POST", "/transactions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, rr.Code)
	}

	inventory, err := inventoryRepo.FindByID(1)
	if err != nil {
		t.Fatalf("Failed to find inventory: %v", err)
	}

	if inventory.Quantity != 30 {
		t.Errorf("Expected inventory quantity to be 10, got %d", inventory.Quantity)
	}
}
