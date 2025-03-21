package handlers_test

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"

	"github.com/gin-gonic/gin"

	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

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
	router.POST("/inventories/:warehouse_id/:product_id", inventoryHandler.CreateInventory)

	cleanupInventory(db)
	CreateTestProduct(db, "TestProduct", "TestSKU")
	CreateTestWarehouse(db, "TestWarehouse", "TestLocation")

	req, err := http.NewRequest("POST", "/inventories/1/1", nil)
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

func TestGetAllInventory(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, inventoryHandler := setupInventory()
	router.GET("/inventories", inventoryHandler.GetAllInventory)

	cleanupInventory(db)
	p, _ := CreateTestProduct(db, "TestProduct", "TestSKU")
	w, _ := CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, p.ID, w.ID, 10)

	req, err := http.NewRequest("GET", "/inventories", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status code %d but got %d", http.StatusOK, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Inventories []models.Inventory `json:"inventories"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if len(resp.Data.Inventories) != 1 {
		t.Errorf("Expected 1 inventories but got %d", len(resp.Data.Inventories))
	}

	if resp.Data.Inventories[0].Product == nil {
		t.Errorf("Expected product to be included in inventory but got nil")
	}
}

func TestGetInventory(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, inventoryHandler := setupInventory()
	router.GET("/inventories/:id", inventoryHandler.GetInventory)

	cleanupInventory(db)
	p, _ := CreateTestProduct(db, "TestProduct", "TestSKU")
	w, _ := CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, p.ID, w.ID, 10)

	req, err := http.NewRequest("GET", "/inventories/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status code %d but got %d", http.StatusOK, rr.Code)
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

	if resp.Data.Inventory.Product == nil {
		t.Errorf("Expected product to be included in inventory but got nil")
	}
}

func TestDeleteInventory(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, inventoryHandler := setupInventory()
	router.DELETE("/inventories/:id", inventoryHandler.DeleteInventory)

	cleanupInventory(db)
	p, _ := CreateTestProduct(db, "TestProduct", "TestSKU")
	w, _ := CreateTestWarehouse(db, "TestWarehouse", "TestLocation")
	CreateTestInventory(db, p.ID, w.ID, 10)

	req, err := http.NewRequest("DELETE", "/inventories/1", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status code %d but got %d", http.StatusOK, rr.Code)
	}

	var inventoryCount int64
	if err := db.Model(&models.Inventory{}).Count(&inventoryCount).Error; err != nil {
		t.Fatalf("Failed to count inventory: %v", err)
	}

	if inventoryCount != 0 {
		t.Errorf("Expected inventory count to be 0 but got %d", inventoryCount)
	}
}
