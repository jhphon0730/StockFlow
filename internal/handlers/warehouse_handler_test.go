package handlers_test

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"

	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
)

func setupWarehouse() (*gorm.DB, *gin.Engine, repositories.WarehouseRepository, services.WarehouseService, handlers.WarehouseHandler) {
	// Test DB 초기화
	db := SetupTestDB()
	warehouseRepo := repositories.NewWarehouseRepository(db)
	warehouseService := services.NewWarehouseService(warehouseRepo)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)

	router := gin.Default()
	return db, router, warehouseRepo, warehouseService, warehouseHandler
}

func cleanupWarehouse(db *gorm.DB) {
	// 테스트 후 DB 초기화
	db.Exec("DELETE FROM warehouses")
}

func TestCreateWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, router, _, _, warehouseHandler := setupWarehouse()
	router.POST("/warehouses", warehouseHandler.CreateWarehouse)

	payload := dto.CreateWarehouseDTO{
		Name:     "TestWarehouse",
		Location: "TestLocation",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", "/warehouses", bytes.NewBuffer(jsonPayload))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status %v, got %v", http.StatusCreated, rr.Code)
	}

	var resp struct {
		Response
		Data struct {
			Warehouse *models.Warehouse `json:"warehouse"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Errorf("Failed to parse JSON response: %v", err)
	}

	if resp.Data.Warehouse == nil {
		t.Errorf("Expected warehouse to be non-nil")
	}

	if resp.Data.Warehouse.Name != payload.Name || resp.Data.Warehouse.Location != payload.Location {
		t.Errorf("Expected warehouse name and location to match payload")
	}
}

func TestGetAllWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, warehouseHandler := setupWarehouse()
	router.GET("/warehouses", warehouseHandler.GetAllWarehouses)

	// Test 데이터 삽입
	cleanupWarehouse(db)
	CreateTestWarehouse(db, "Warehouse1", "Location1")
	CreateTestWarehouse(db, "Warehouse2", "Location2")

	req, err := http.NewRequest("GET", "/warehouses", nil)
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
			Warehouses []models.Warehouse `json:"warehouses"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if len(resp.Data.Warehouses) != 2 {
		t.Errorf("Expected 2 warehouses, got %v", len(resp.Data.Warehouses))
	}
}

func TestGetWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, warehouseHandler := setupWarehouse()
	router.GET("/warehouses/:id", warehouseHandler.GetWarehouse)

	// Test 데이터 삽입
	cleanupWarehouse(db)
	warehouse, err := CreateTestWarehouse(db, "Warehouse1", "Location1")
	if err != nil {
		t.Errorf("Failed to create test warehouse: %v", err)
	}

	req, err := http.NewRequest("GET", "/warehouses/"+strconv.Itoa(int(warehouse.ID)), nil)
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
			Warehouse *models.Warehouse `json:"warehouse"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Errorf("Failed to parse JSON response: %v", err)
	}

	if resp.Data.Warehouse == nil {
		t.Errorf("Expected warehouse to be non-nil")
	}
}

func TestDeleteWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, router, _, _, warehouseHandler := setupWarehouse()
	router.DELETE("/warehouses/:id", warehouseHandler.DeleteWarehouse)

	// Test 데이터 삽입
	cleanupWarehouse(db)
	warehouse, err := CreateTestWarehouse(db, "Warehouse1", "Location1")
	if err != nil {
		t.Errorf("Failed to create test warehouse: %v", err)
	}

	req, err := http.NewRequest("DELETE", "/warehouses/"+strconv.Itoa(int(warehouse.ID)), nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %v, got %v", http.StatusOK, rr.Code)
	}

	var warehouseCount int64
	if err := db.Model(&models.Warehouse{}).Where("id = ?", warehouse.ID).Count(&warehouseCount).Error; err != nil {
		t.Errorf("Failed to count warehouses: %v", err)
	}

	if warehouseCount != 0 {
		t.Errorf("Expected warehouse to be deleted")
	}
}
