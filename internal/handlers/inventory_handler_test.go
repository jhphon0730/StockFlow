package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"gorm.io/gorm"
)

func setupInventory() (*gorm.DB, *gin.Engine, repositories.InventoryRepository, services.InventoryService, handlers.InventoryHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	inventoryRepo := repositories.NewInventoryRepository(db)
	inventoryService := services.NewInventoryService(inventoryRepo)
	inventoryHandler := handlers.NewInventoryHandler(inventoryService)

	router := gin.Default()
	return db, router, inventoryRepo, inventoryService, inventoryHandler
}

func cleanupInventory(db *gorm.DB) {
	db.Exec("DELETE FROM products")
}

func TestCreateInventory(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, inventoryHandler := setupInventory()
	router.POST("/inventorys/:warehouse_id/:product_id", inventoryHandler.CreateInventory)

	cleanupInventory(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")

	req, err := http.NewRequest("POST", "/inventorys/1/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status code %d but got %d", http.StatusCreated, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Inventory *models.Inventory `json:"inventory"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if resp.Data.Inventory == nil {
		t.Fatalf("Expected inventory to be returned but got nil")
	}

	if resp.Data.Inventory.ID != 1 {
		t.Errorf("Expected inventory ID to be 1 but got %d", resp.Data.Inventory.ID)
	}
}
