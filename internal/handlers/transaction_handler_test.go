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

func setupTransaction() (*gorm.DB, *gin.Engine, repositories.TransactionRepository, services.TransactionService, handlers.TransactionHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	transactionRepo := repositories.NewTransactionRepository(db)
	transactionService := services.NewTransactionService(transactionRepo)
	transactionHandler := handlers.NewTransactionHandler(transactionService)

	router := gin.Default()
	return db, router, transactionRepo, transactionService, transactionHandler
}

func cleanupTransaction(db *gorm.DB) {
	db.Exec("DELETE FROM transactions")
}

func TestCreateTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, transactionHandler := setupTransaction()
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
