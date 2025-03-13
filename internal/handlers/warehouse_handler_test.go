package handlers_test

import (
	"github.com/jhphon0730/StockFlow/internal/handlers"
	"github.com/jhphon0730/StockFlow/internal/models"
	"github.com/jhphon0730/StockFlow/internal/repositories"
	"github.com/jhphon0730/StockFlow/internal/services"
	"github.com/jhphon0730/StockFlow/pkg/dto"

	"github.com/gin-gonic/gin"

	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
)

func TestCreateWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := SetupTestDB()
	warehouseRepo := repositories.NewWarehouseRepository(db)
	warehouseService := services.NewWarehouseService(warehouseRepo)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)

	router := gin.Default()
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

func TestGetWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := SetupTestDB()
	warehouseRepo := repositories.NewWarehouseRepository(db)
	warehouseService := services.NewWarehouseService(warehouseRepo)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)

	router := gin.Default()
	router.GET("/warehouses/:id", warehouseHandler.GetWarehouse)

	warehouse, err := CreateTestWarehouse(db)
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
}

func TestDeleteWarehouse(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := SetupTestDB()
	warehouseRepo := repositories.NewWarehouseRepository(db)
	warehouseService := services.NewWarehouseService(warehouseRepo)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)

	router := gin.Default()
	router.DELETE("/warehouses/:id", warehouseHandler.DeleteWarehouse)

	warehouse, err := CreateTestWarehouse(db)
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
		t.Errorf("Expected status %v, got %v", http.StatusCreated, rr.Code)
	}

	var warehouseCount int64
	if err := db.Model(&models.Warehouse{}).Where("id = ?", warehouse.ID).Count(&warehouseCount).Error; err != nil {
		t.Errorf("Failed to count warehouses: %v", err)
	}

	if warehouseCount != 0 {
		t.Errorf("Expected warehouse to be deleted")
	}
}
